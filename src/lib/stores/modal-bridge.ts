import { writable, get } from 'svelte/store';
import type { FavFolder, CategoryResult, VideoResource } from '$lib/types';

// ================= Folder Select Bridge =================

export interface FolderSelectRequest {
  folders: FavFolder[];
  resolve: (ids: number[]) => void;
  reject: (reason?: unknown) => void;
}

export const folderSelectRequest = writable<FolderSelectRequest | null>(null);

export function requestFolderSelect(folders: FavFolder[]): Promise<number[]> {
  return new Promise((resolve, reject) => {
    folderSelectRequest.set({ folders, resolve, reject });
  });
}

export function resolveFolderSelect(ids: number[]): void {
  const req = get(folderSelectRequest);
  if (req) {
    folderSelectRequest.set(null);
    req.resolve(ids);
  }
}

export function rejectFolderSelect(): void {
  const req = get(folderSelectRequest);
  if (req) {
    folderSelectRequest.set(null);
    req.reject(new Error('用户取消选择'));
  }
}

// ================= Preview Confirm Bridge =================

export interface PreviewConfirmRequest {
  categories: CategoryResult;
  videos: VideoResource[];
  resolve: (data: CategoryResult) => void;
  reject: (reason?: unknown) => void;
}

export const previewConfirmRequest = writable<PreviewConfirmRequest | null>(null);

export function requestPreviewConfirm(
  categories: CategoryResult,
  videos: VideoResource[],
): Promise<CategoryResult> {
  return new Promise((resolve, reject) => {
    previewConfirmRequest.set({ categories, videos, resolve, reject });
  });
}

export function resolvePreviewConfirm(data: CategoryResult): void {
  const req = get(previewConfirmRequest);
  if (req) {
    previewConfirmRequest.set(null);
    req.resolve(data);
  }
}

export function rejectPreviewConfirm(): void {
  const req = get(previewConfirmRequest);
  if (req) {
    previewConfirmRequest.set(null);
    req.reject(new Error('用户取消确认'));
  }
}

// ================= Reject All =================

export function rejectAllModals(): void {
  rejectFolderSelect();
  rejectPreviewConfirm();
}
