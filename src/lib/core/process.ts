import type { Settings, BiliData, VideoResource, CategoryResult } from '$lib/types';
import { get } from 'svelte/store';
import {
  isRunning, cancelRequested, logs,
  progressPhase, progressCurrent, progressTotal, progressStartTime,
  resetTokenUsage, tokenUsage,
} from '$lib/stores/state';
import {
  getSourceMediaId, getAllFoldersWithIds, getMyFolders,
  createFolder, moveVideos, fetchAllVideos, invalidateFolderCache,
} from '$lib/api/bilibili';
import { callAI } from '$lib/api/ai-client';
import { estimateCost, formatTokenCount } from '$lib/api/ai-providers';
import { requestFolderSelect, requestPreviewConfirm } from '$lib/stores/modal-bridge';
import { isDeadVideo } from '$lib/utils/dom';
import { humanDelay, sleep, createConcurrencyLimiter } from '$lib/utils/timing';
import { gmSetValue, gmGetValue } from '$lib/utils/gm';
import { saveUndoData, type UndoRecord } from '$lib/core/undo';
import { saveHistoryEntry } from '$lib/core/history';

// ================= 系统提示词模板 =================
function buildSystemPrompt(existingFolderNames: string[], customPrompt: string): string {
  const existingPart = existingFolderNames.length > 0
    ? `\n\n【已有收藏夹列表】\n${existingFolderNames.map(n => `• ${n}`).join('\n')}\n\n必须优先使用以上已有收藏夹名！只有当视频完全不适合任何已有分类时，才可新建。`
    : '';

  const customPart = customPrompt
    ? `\n\n【用户自定义规则（最高优先级）】\n${customPrompt}`
    : '';

  return `你是逻辑严密的B站收藏夹视频分类专家。

【任务】
将以下视频分类到合适的收藏夹。

【规则】
1. 每个视频必须且只能属于一个分类
2. 输出纯JSON，格式：{"thoughts":"分析过程","categories":{"收藏夹名":[{"id":数字,"type":数字,"conf":置信度0-1}]}}
3. conf 表示分类置信度，1.0=非常确定，0.5=不太确定
4. 绝不遗漏任何视频${existingPart}${customPart}`.trim();
}

// ================= 进度更新 =================
function updateProgress(phase: string, current: number, total: number) {
  progressPhase.set(phase as any);
  progressCurrent.set(current);
  progressTotal.set(total);

  // 标题栏进度
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  document.title = `[${phase} ${pct}%] B站收藏夹整理`;
}

// ================= 主流程 =================
export async function startProcess(settings: Settings, biliData: BiliData): Promise<void> {
  // 防止重复运行
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
    // ========== Phase 1: 获取源收藏夹 ==========
    let sourceMediaIds: number[] = [];

    if (settings.multiFolderEnabled) {
      const allFolders = await getAllFoldersWithIds(biliData);
      logs.add('请在弹出的面板中选择要整理的收藏夹...', 'info');
      sourceMediaIds = await requestFolderSelect(allFolders);
      if (sourceMediaIds.length === 0) throw new Error('未选择任何收藏夹');
    } else {
      const id = getSourceMediaId();
      if (!id) throw new Error('无法获取当前收藏夹 ID，请在收藏夹页面操作');
      sourceMediaIds = [Number(id)];
    }

    logs.add(`开始整理 ${sourceMediaIds.length} 个收藏夹`, 'info');

    // ========== Phase 2: 获取现有文件夹 ==========
    const existingFoldersMap = await getMyFolders(biliData);
    const existingFolderNames = Object.keys(existingFoldersMap);
    logs.add(`已有 ${existingFolderNames.length} 个收藏夹`, 'info');

    // ========== Phase 3: 抓取视频 ==========
    let allVideos: VideoResource[] = [];
    const videoIdMap: Map<number, VideoResource> = new Map();
    const videoSourceMap: Map<number, number> = new Map();

    for (const mediaId of sourceMediaIds) {
      if (isCancelled()) break;

      logs.add(`正在抓取收藏夹 ${mediaId}...`, 'info');
      const videos = await fetchAllVideos(
        mediaId,
        settings.fetchDelay,
        isCancelled,
        (page, total) => updateProgress('fetch', page, total)
      );

      let validVideos = videos;

      // 跳过失效视频
      if (settings.skipDeadVideos) {
        const before = validVideos.length;
        validVideos = validVideos.filter((v) => !isDeadVideo(v));
        const skipped = before - validVideos.length;
        if (skipped > 0) logs.add(`跳过 ${skipped} 个失效视频`, 'info');
      }

      // 增量模式
      if (settings.incrementalMode) {
        const lastRunTime = gmGetValue('bfao_lastRunTime', 0);
        if (lastRunTime > 0) {
          const before = validVideos.length;
          validVideos = validVideos.filter((v) => v.fav_time > lastRunTime);
          logs.add(`增量模式：${before} → ${validVideos.length} 个新视频`, 'info');
        }
      }

      for (const v of validVideos) {
        videoIdMap.set(v.id, v);
        videoSourceMap.set(v.id, mediaId);
      }
      allVideos.push(...validVideos);
    }

    if (isCancelled()) {
      logs.add('用户取消了操作', 'warning');
      return;
    }

    if (allVideos.length === 0) {
      logs.add('没有需要整理的视频', 'info');
      return;
    }

    logs.add(`共 ${allVideos.length} 个视频待分类`, 'success');

    // ========== Phase 4: AI 分类 ==========
    let allCategories: CategoryResult = {};
    const systemPrompt = buildSystemPrompt(existingFolderNames, settings.lastPrompt);
    const limiter = createConcurrencyLimiter(settings.aiConcurrency);
    const aiPromises: Promise<void>[] = [];
    let aiCompleted = 0;
    let totalAiCalls = 0;

    // 分块
    const chunks: VideoResource[][] = [];
    for (let i = 0; i < allVideos.length; i += settings.aiChunkSize) {
      chunks.push(allVideos.slice(i, i + settings.aiChunkSize));
    }
    totalAiCalls = chunks.length;

    logs.add(`分为 ${totalAiCalls} 批次，并发 ${settings.aiConcurrency}`, 'info');

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

          // 合并分类结果
          if (aiResult?.categories) {
            for (const [catName, vids] of Object.entries(aiResult.categories)) {
              if (!allCategories[catName]) allCategories[catName] = [];
              allCategories[catName].push(...(vids as any[]));
            }
          }

          aiCompleted++;
          updateProgress('ai', aiCompleted, totalAiCalls);
          logs.add(`AI 批次 ${idx} 完成`, 'success');
        } catch (err: any) {
          aiCompleted++;
          updateProgress('ai', aiCompleted, totalAiCalls);
          logs.add(`AI 批次 ${idx} 失败: ${err.message}`, 'error');
        }
      });

      aiPromises.push(p);
    }

    // 等待所有 AI 调用完成
    await Promise.all(aiPromises);

    if (isCancelled()) {
      logs.add('用户取消了操作', 'warning');
      return;
    }

    const categoryCount = Object.keys(allCategories).length;
    if (categoryCount === 0) {
      logs.add('AI 未返回任何分类结果', 'error');
      return;
    }

    // ========== Phase 4.5: 去重 & 遗漏检测 ==========
    const assignedIds = new Set<string>();
    for (const [, vids] of Object.entries(allCategories)) {
      // 去重同一分类内
      const seen = new Set<string>();
      const deduped = (vids as any[]).filter((v) => {
        const key = `${v.id}:${v.type}`;
        if (seen.has(key) || assignedIds.has(key)) return false;
        seen.add(key);
        assignedIds.add(key);
        return true;
      });
      (allCategories as any)[Object.keys(allCategories).find((k) =>
        allCategories[k] === vids
      )!] = deduped;
    }

    // 遗漏检测
    const missedVideos = allVideos.filter(
      (v) => !assignedIds.has(`${v.id}:${v.type}`)
    );
    if (missedVideos.length > 0) {
      logs.add(`发现 ${missedVideos.length} 个遗漏视频，归入「未分类」`, 'warning');
      allCategories['未分类'] = missedVideos.map((v) => ({
        id: v.id,
        type: v.type,
        conf: 0.3,
      }));
    }

    // 碎片合并
    const tinyCats = Object.entries(allCategories).filter(
      ([name, vids]) =>
        (vids as any[]).length === 1 &&
        !existingFoldersMap[name] &&
        name !== '未分类'
    );
    if (tinyCats.length >= 3) {
      logs.add(`合并 ${tinyCats.length} 个碎片分类`, 'info');
      if (!allCategories['未分类']) allCategories['未分类'] = [];
      for (const [name, vids] of tinyCats) {
        allCategories['未分类'].push(...(vids as any[]));
        delete allCategories[name];
      }
    }

    logs.add(
      `AI 分类完成: ${Object.keys(allCategories).length} 个分类，${allVideos.length} 个视频`,
      'success'
    );

    // ========== Phase 5: 预览确认 ==========
    logs.add(
      `分类结果: ${Object.entries(allCategories)
        .map(([k, v]) => `${k}(${(v as any[]).length})`)
        .join(', ')}`,
      'info'
    );
    logs.add('请在弹出的面板中确认分类结果...', 'info');
    allCategories = await requestPreviewConfirm(allCategories, allVideos);

    if (isCancelled()) throw new Error('用户取消操作');

    // ========== Phase 6: 创建文件夹 & 移动视频 ==========
    invalidateFolderCache();
    const entries = Object.entries(allCategories);
    let moveIdx = 0;
    const undoMoves: UndoRecord['moves'] = [];

    for (const [categoryName, vids] of entries) {
      if (isCancelled()) break;

      let targetFolderId = existingFoldersMap[categoryName];

      // 模糊匹配
      if (!targetFolderId) {
        const fuzzyKey = Object.keys(existingFoldersMap).find(
          (k) => k.trim().toLowerCase() === categoryName.trim().toLowerCase()
        );
        if (fuzzyKey) targetFolderId = existingFoldersMap[fuzzyKey];
      }

      // 新建
      if (!targetFolderId) {
        try {
          targetFolderId = await createFolder(categoryName, biliData);
          existingFoldersMap[categoryName] = targetFolderId;
        } catch (e: any) {
          logs.add(`创建收藏夹「${categoryName}」失败: ${e.message}`, 'error');
          continue;
        }
      }

      // 分块移动
      const videos = vids as any[];
      for (let i = 0; i < videos.length; i += settings.moveChunkSize) {
        if (isCancelled()) break;

        const chunk = videos.slice(i, i + settings.moveChunkSize);

        // 按来源分组
        const bySource: Record<number, any[]> = {};
        for (const v of chunk) {
          const src = videoSourceMap.get(v.id) ?? sourceMediaIds[0];
          if (!bySource[src]) bySource[src] = [];
          bySource[src].push(v);
        }

        for (const [fromStr, subChunk] of Object.entries(bySource)) {
          const from = Number(fromStr);
          const resourcesStr = subChunk
            .map((v: any) => `${v.id}:${v.type}`)
            .join(',');
          const success = await moveVideos(
            from,
            targetFolderId,
            resourcesStr,
            biliData
          );

          if (success) {
            moveIdx += subChunk.length;
            updateProgress('move', moveIdx, allVideos.length);

            // 记录撤销数据
            undoMoves.push({
              fromMediaId: from,
              toMediaId: targetFolderId,
              resources: resourcesStr,
              count: subChunk.length,
            });
          } else {
            logs.add(
              `移动到「${categoryName}」部分失败 (${subChunk.length} 个视频)`,
              'warning'
            );
          }

          await humanDelay(settings.writeDelay);
        }
      }
    }

    // ========== Phase 7: 完成报告 ==========
    const elapsed = Date.now() - get(progressStartTime);
    const elapsedStr =
      elapsed > 60000
        ? `${(elapsed / 60000).toFixed(1)} 分钟`
        : `${(elapsed / 1000).toFixed(1)} 秒`;

    logs.add(
      `整理完成！共处理 ${allVideos.length} 个视频，${Object.keys(allCategories).length} 个分类，耗时 ${elapsedStr}`,
      'success'
    );

    // Token 统计
    const usage = get(tokenUsage);
    if (usage.totalTokens > 0) {
      logs.add(
        `Token 用量: ${formatTokenCount(usage.promptTokens)} 输入 + ${formatTokenCount(usage.completionTokens)} 输出`,
        'info'
      );
      const cost = estimateCost(settings.modelName);
      if (cost) logs.add(`预估费用: ${cost}`, 'info');
    }

    // 保存撤销数据
    if (undoMoves.length > 0) {
      const categoryNames = Object.keys(allCategories);
      saveUndoData({
        time: new Date().toISOString(),
        timeLocal: new Date().toLocaleString('zh-CN'),
        totalVideos: allVideos.length,
        totalCategories: categoryNames.length,
        sourceMediaIds,
        moves: undoMoves,
      });
    }

    // 保存整理历史
    saveHistoryEntry({
      time: new Date().toLocaleString('zh-CN'),
      videoCount: allVideos.length,
      categoryCount: Object.keys(allCategories).length,
      categories: Object.keys(allCategories).join(', '),
    });

    // 保存增量模式时间戳
    gmSetValue('bfao_lastRunTime', Math.floor(Date.now() / 1000));

    // 恢复标题
    document.title = document.title.replace(/^\[.*?\]\s*/, '');

  } finally {
    isRunning.set(false);
    cancelRequested.set(false);
    progressPhase.set('');
    progressCurrent.set(0);
    progressTotal.set(0);
    document.title = document.title.replace(/^\[.*?\]\s*/, '');
  }
}
