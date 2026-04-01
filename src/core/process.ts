import type { Settings, BiliData, VideoResource, CategoryResult } from '$types/index';
import { get } from 'svelte/store';
import {
  isRunning, cancelRequested, logs,
  progressStartTime, resetTokenUsage, tokenUsage,
} from '$stores/state';
import {
  getSourceMediaId, getAllFoldersWithIds, getMyFolders,
  createFolder, moveVideos, fetchAllVideos, invalidateFolderCache,
} from '$api/bilibili';
import { callAI } from '$api/ai-client';
import { buildSystemPrompt } from '$api/ai-prompt';
import { estimateCost, formatTokenCount } from '$api/ai-providers';
import { folderSelect, requestPreviewConfirm } from '$stores/modal-bridge';
import { isDeadVideo } from '$utils/dom';
import { humanDelay, createConcurrencyLimiter, formatNow } from '$utils/timing';
import { gmSetValue, gmGetValue } from '$utils/gm';
import { saveUndoData, type UndoRecord } from '$core/undo';
import { saveHistoryEntry } from '$core/history';
import { getErrorMessage } from '$utils/errors';
import { groupBy } from '$utils/collections';
import { UNCATEGORIZED_FOLDER } from '$utils/constants';
import { updateProgress, resetProgress } from '$utils/progress';

// ================= Helpers =================

type CancelCheck = () => boolean;

// ================= Phase 1: Resolve source folders =================

async function resolveSourceFolders(
  settings: Settings,
  biliData: BiliData,
): Promise<number[]> {
  if (settings.multiFolderEnabled) {
    const allFolders = await getAllFoldersWithIds(biliData);
    logs.add('请在弹出的面板中选择要整理的收藏夹...', 'info');
    const ids = await folderSelect.request(allFolders);
    if (ids.length === 0) throw new Error('未选择任何收藏夹');
    return ids;
  }
  const id = getSourceMediaId();
  if (!id) throw new Error('无法获取当前收藏夹 ID，请在收藏夹页面操作');
  return [Number(id)];
}

// ================= Phase 2: Fetch videos from source folders =================

interface FetchResult {
  allVideos: VideoResource[];
  videoSourceMap: Map<number, number>;
}

async function fetchSourceVideos(
  sourceMediaIds: number[],
  settings: Settings,
  isCancelled: CancelCheck,
): Promise<FetchResult> {
  const allVideos: VideoResource[] = [];
  const videoSourceMap: Map<number, number> = new Map();

  for (const mediaId of sourceMediaIds) {
    if (isCancelled()) break;

    logs.add(`正在抓取收藏夹 ${mediaId}...`, 'info');
    const videos = await fetchAllVideos(
      mediaId,
      settings.fetchDelay,
      isCancelled,
      (page, total) => updateProgress('fetch', page, total),
    );

    let validVideos = videos;

    if (settings.skipDeadVideos) {
      const before = validVideos.length;
      validVideos = validVideos.filter((v) => !isDeadVideo(v));
      const skipped = before - validVideos.length;
      if (skipped > 0) logs.add(`跳过 ${skipped} 个失效视频`, 'info');
    }

    if (settings.incrementalMode) {
      const lastRunTime = gmGetValue('bfao_lastRunTime', 0);
      if (lastRunTime > 0) {
        const before = validVideos.length;
        validVideos = validVideos.filter((v) => v.fav_time > lastRunTime);
        logs.add(`增量模式：${before} → ${validVideos.length} 个新视频`, 'info');
      }
    }

    for (const v of validVideos) {
      videoSourceMap.set(v.id, mediaId);
    }
    allVideos.push(...validVideos);
  }

  return { allVideos, videoSourceMap };
}

// ================= Phase 3: AI classification =================

async function classifyWithAI(
  allVideos: VideoResource[],
  existingFolderNames: string[],
  settings: Settings,
  isCancelled: CancelCheck,
): Promise<CategoryResult> {
  const allCategories: CategoryResult = {};
  const systemPrompt = buildSystemPrompt(existingFolderNames, settings.lastPrompt);
  const limiter = createConcurrencyLimiter(settings.aiConcurrency);

  const chunks: VideoResource[][] = [];
  for (let i = 0; i < allVideos.length; i += settings.aiChunkSize) {
    chunks.push(allVideos.slice(i, i + settings.aiChunkSize));
  }

  const totalAiCalls = chunks.length;
  let aiCompleted = 0;

  logs.add(`分为 ${totalAiCalls} 批次，并发 ${settings.aiConcurrency}`, 'info');

  const aiPromises: Promise<void>[] = [];

  for (let ci = 0; ci < chunks.length; ci++) {
    if (isCancelled()) break;

    const chunk = chunks[ci];
    const idx = ci + 1;

    const videoData = chunk.map((v) => ({
      id: v.id,
      type: v.type,
      title: v.title,
      up: v.upper?.name ?? '',
      play: v.cnt_info?.play ?? 0,
      duration: v.duration ?? 0,
    }));

    const combinedPrompt = {
      system: systemPrompt,
      user: `以下是待处理的 ${chunk.length} 个视频：\n${JSON.stringify(videoData)}`,
    };

    const p = limiter.run(async () => {
      try {
        logs.add(`AI 批次 ${idx}/${totalAiCalls} 处理中...`, 'info');
        const aiResult = await callAI(combinedPrompt, settings);

        if (aiResult?.categories) {
          for (const [catName, vids] of Object.entries(aiResult.categories)) {
            if (!allCategories[catName]) allCategories[catName] = [];
            allCategories[catName].push(...vids);
          }
        }

        aiCompleted++;
        updateProgress('ai', aiCompleted, totalAiCalls);
        logs.add(`AI 批次 ${idx} 完成`, 'success');
      } catch (err: unknown) {
        aiCompleted++;
        updateProgress('ai', aiCompleted, totalAiCalls);
        logs.add(`AI 批次 ${idx} 失败: ${getErrorMessage(err)}`, 'error');
      }
    });

    aiPromises.push(p);
  }

  await Promise.all(aiPromises);
  return allCategories;
}

// ================= Phase 4: Post-process categories =================

function postProcessCategories(
  allCategories: CategoryResult,
  allVideos: VideoResource[],
  existingFoldersMap: Record<string, number>,
): CategoryResult {
  // Deduplicate within and across categories
  const assignedIds = new Set<string>();
  for (const catName of Object.keys(allCategories)) {
    const vids = allCategories[catName];
    const seen = new Set<string>();
    allCategories[catName] = vids.filter((v) => {
      const key = `${v.id}:${v.type}`;
      if (seen.has(key) || assignedIds.has(key)) return false;
      seen.add(key);
      assignedIds.add(key);
      return true;
    });
  }

  // Detect missed videos
  const missedVideos = allVideos.filter(
    (v) => !assignedIds.has(`${v.id}:${v.type}`),
  );
  if (missedVideos.length > 0) {
    logs.add(`发现 ${missedVideos.length} 个遗漏视频，归入「未分类」`, 'warning');
    allCategories[UNCATEGORIZED_FOLDER] = missedVideos.map((v) => ({
      id: v.id,
      type: v.type,
      conf: 0.3,
    }));
  }

  // Merge tiny categories
  const tinyCats = Object.entries(allCategories).filter(
    ([name, vids]) =>
      vids.length === 1 &&
      !existingFoldersMap[name] &&
      name !== UNCATEGORIZED_FOLDER,
  );
  if (tinyCats.length >= 3) {
    logs.add(`合并 ${tinyCats.length} 个碎片分类`, 'info');
    if (!allCategories[UNCATEGORIZED_FOLDER]) allCategories[UNCATEGORIZED_FOLDER] = [];
    for (const [name, vids] of tinyCats) {
      allCategories[UNCATEGORIZED_FOLDER].push(...vids);
      delete allCategories[name];
    }
  }

  return allCategories;
}

// ================= Phase 5: Move videos to folders =================

async function moveVideosToFolders(
  allCategories: CategoryResult,
  existingFoldersMap: Record<string, number>,
  videoSourceMap: Map<number, number>,
  sourceMediaIds: number[],
  allVideos: VideoResource[],
  settings: Settings,
  biliData: BiliData,
  isCancelled: CancelCheck,
): Promise<UndoRecord['moves']> {
  invalidateFolderCache();
  const entries = Object.entries(allCategories);
  let moveIdx = 0;
  const undoMoves: UndoRecord['moves'] = [];

  for (const [categoryName, vids] of entries) {
    if (isCancelled()) break;

    let targetFolderId = existingFoldersMap[categoryName];

    // Fuzzy match
    if (!targetFolderId) {
      const fuzzyKey = Object.keys(existingFoldersMap).find(
        (k) => k.trim().toLowerCase() === categoryName.trim().toLowerCase(),
      );
      if (fuzzyKey) targetFolderId = existingFoldersMap[fuzzyKey];
    }

    // Create new folder
    if (!targetFolderId) {
      try {
        targetFolderId = await createFolder(categoryName, biliData);
        existingFoldersMap[categoryName] = targetFolderId;
      } catch (e: unknown) {
        logs.add(`创建收藏夹「${categoryName}」失败: ${getErrorMessage(e)}`, 'error');
        continue;
      }
    }

    // Move in chunks
    for (let i = 0; i < vids.length; i += settings.moveChunkSize) {
      if (isCancelled()) break;

      const chunk = vids.slice(i, i + settings.moveChunkSize);

      // Group by source
      const bySource = groupBy(chunk, (v) => videoSourceMap.get(v.id) ?? sourceMediaIds[0]);

      for (const [fromStr, subChunk] of Object.entries(bySource)) {
        const from = Number(fromStr);
        const resourcesStr = subChunk
          .map((v) => `${v.id}:${v.type}`)
          .join(',');
        const success = await moveVideos(from, targetFolderId, resourcesStr, biliData);

        if (success) {
          moveIdx += subChunk.length;
          updateProgress('move', moveIdx, allVideos.length);
          undoMoves.push({
            fromMediaId: from,
            toMediaId: targetFolderId,
            resources: resourcesStr,
            count: subChunk.length,
          });
        } else {
          logs.add(
            `移动到「${categoryName}」部分失败 (${subChunk.length} 个视频)`,
            'warning',
          );
        }

        await humanDelay(settings.writeDelay);
      }
    }
  }

  return undoMoves;
}

// ================= Phase 6: Final report =================

function emitFinalReport(
  allVideos: VideoResource[],
  allCategories: CategoryResult,
  sourceMediaIds: number[],
  undoMoves: UndoRecord['moves'],
  settings: Settings,
) {
  const elapsed = Date.now() - get(progressStartTime);
  const elapsedStr =
    elapsed > 60000
      ? `${(elapsed / 60000).toFixed(1)} 分钟`
      : `${(elapsed / 1000).toFixed(1)} 秒`;

  logs.add(
    `整理完成！共处理 ${allVideos.length} 个视频，${Object.keys(allCategories).length} 个分类，耗时 ${elapsedStr}`,
    'success',
  );

  const usage = get(tokenUsage);
  if (usage.totalTokens > 0) {
    logs.add(
      `Token 用量: ${formatTokenCount(usage.promptTokens)} 输入 + ${formatTokenCount(usage.completionTokens)} 输出`,
      'info',
    );
    const cost = estimateCost(settings.modelName);
    if (cost) logs.add(`预估费用: ${cost}`, 'info');
  }

  if (undoMoves.length > 0) {
    const { time, timeLocal } = formatNow();
    saveUndoData({
      time,
      timeLocal,
      totalVideos: allVideos.length,
      totalCategories: Object.keys(allCategories).length,
      sourceMediaIds,
      moves: undoMoves,
    });
  }

  saveHistoryEntry({
    time: formatNow().timeLocal,
    videoCount: allVideos.length,
    categoryCount: Object.keys(allCategories).length,
    categories: Object.keys(allCategories).join(', '),
  });

  gmSetValue('bfao_lastRunTime', Math.floor(Date.now() / 1000));
}

// ================= Main Orchestrator =================

export async function startProcess(settings: Settings, biliData: BiliData): Promise<void> {
  if (get(isRunning)) {
    logs.add('已有整理任务在运行中', 'warning');
    return;
  }

  isRunning.set(true);
  cancelRequested.set(false);
  resetTokenUsage();
  progressStartTime.set(Date.now());

  const isCancelled = () => get(cancelRequested);

  try {
    // Phase 1: Resolve source folders
    const sourceMediaIds = await resolveSourceFolders(settings, biliData);
    logs.add(`开始整理 ${sourceMediaIds.length} 个收藏夹`, 'info');

    // Phase 2: Get existing folders
    const existingFoldersMap = await getMyFolders(biliData);
    const existingFolderNames = Object.keys(existingFoldersMap);
    logs.add(`已有 ${existingFolderNames.length} 个收藏夹`, 'info');

    // Phase 3: Fetch videos
    const { allVideos, videoSourceMap } = await fetchSourceVideos(
      sourceMediaIds, settings, isCancelled,
    );

    if (isCancelled()) { logs.add('用户取消了操作', 'warning'); return; }
    if (allVideos.length === 0) { logs.add('没有需要整理的视频', 'info'); return; }
    logs.add(`共 ${allVideos.length} 个视频待分类`, 'success');

    // Phase 4: AI classification
    let allCategories = await classifyWithAI(
      allVideos, existingFolderNames, settings, isCancelled,
    );

    if (isCancelled()) { logs.add('用户取消了操作', 'warning'); return; }
    if (Object.keys(allCategories).length === 0) {
      logs.add('AI 未返回任何分类结果', 'error');
      return;
    }

    // Phase 4.5: Post-process
    allCategories = postProcessCategories(allCategories, allVideos, existingFoldersMap);

    logs.add(
      `AI 分类完成: ${Object.keys(allCategories).length} 个分类，${allVideos.length} 个视频`,
      'success',
    );

    // Phase 5: Preview & confirm
    logs.add(
      `分类结果: ${Object.entries(allCategories)
        .map(([k, v]) => `${k}(${v.length})`)
        .join(', ')}`,
      'info',
    );
    logs.add('请在弹出的面板中确认分类结果...', 'info');
    allCategories = await requestPreviewConfirm(allCategories, allVideos);

    if (isCancelled()) throw new Error('用户取消操作');

    // Phase 6: Move videos
    const undoMoves = await moveVideosToFolders(
      allCategories, existingFoldersMap, videoSourceMap,
      sourceMediaIds, allVideos, settings, biliData, isCancelled,
    );

    // Phase 7: Report
    emitFinalReport(allVideos, allCategories, sourceMediaIds, undoMoves, settings);

  } finally {
    isRunning.set(false);
    cancelRequested.set(false);
    resetProgress();
  }
}
