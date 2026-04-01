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
 * 返回可直接订阅的 store + request/resolve/reject 方法
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

// ================= Bridge Instances =================

export const folderSelect = createModalBridge<FavFolder[], number[]>();

interface PreviewInput {
  categories: CategoryResult;
  videos: VideoResource[];
}

export const previewConfirm = createModalBridge<PreviewInput, CategoryResult>();

/** 便捷方法：组合 categories + videos 发起预览请求 */
export function requestPreviewConfirm(
  categories: CategoryResult,
  videos: VideoResource[],
): Promise<CategoryResult> {
  return previewConfirm.request({ categories, videos });
}

// ================= Reject All =================

export function rejectAllModals(): void {
  folderSelect.reject();
  previewConfirm.reject();
}
