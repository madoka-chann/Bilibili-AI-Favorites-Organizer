import { writable, get } from 'svelte/store';
import type { FavFolder, CategoryResult, VideoResource } from '$lib/types';

// ================= Generic Modal Bridge =================

interface ModalRequest<TInput, TResult> {
  input: TInput;
  resolve: (value: TResult) => void;
  reject: (reason?: unknown) => void;
}

/**
 * 创建一个 Promise 桥接模式的 modal store
 * 消除 FolderSelect / PreviewConfirm 中的重复代码
 */
function createModalBridge<TInput, TResult>() {
  const store = writable<ModalRequest<TInput, TResult> | null>(null);

  function request(input: TInput): Promise<TResult> {
    const pending = get(store);
    if (pending) pending.reject(new Error('被新请求覆盖'));

    return new Promise((resolve, reject) => {
      store.set({ input, resolve, reject });
    });
  }

  function resolve(value: TResult): void {
    const req = get(store);
    if (req) {
      store.set(null);
      req.resolve(value);
    }
  }

  function reject(): void {
    const req = get(store);
    if (req) {
      store.set(null);
      req.reject(new Error('用户取消'));
    }
  }

  return { subscribe: store.subscribe, request, resolve, reject };
}

// ================= Folder Select Bridge =================

const folderBridge = createModalBridge<FavFolder[], number[]>();

export const folderSelectRequest = {
  subscribe: folderBridge.subscribe,
};

export const requestFolderSelect = folderBridge.request;
export const resolveFolderSelect = folderBridge.resolve;
export const rejectFolderSelect = folderBridge.reject;

// ================= Preview Confirm Bridge =================

interface PreviewInput {
  categories: CategoryResult;
  videos: VideoResource[];
}

const previewBridge = createModalBridge<PreviewInput, CategoryResult>();

export const previewConfirmRequest = {
  subscribe: previewBridge.subscribe,
};

export function requestPreviewConfirm(
  categories: CategoryResult,
  videos: VideoResource[],
): Promise<CategoryResult> {
  return previewBridge.request({ categories, videos });
}

export const resolvePreviewConfirm = previewBridge.resolve;
export const rejectPreviewConfirm = previewBridge.reject;

// ================= Reject All =================

export function rejectAllModals(): void {
  rejectFolderSelect();
  rejectPreviewConfirm();
}
