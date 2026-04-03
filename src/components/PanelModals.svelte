<script lang="ts">
  import DeadVideosResult from './DeadVideosResult.svelte';
  import DuplicatesResult from './DuplicatesResult.svelte';
  import UndoDialog from './UndoDialog.svelte';
  import HistoryTimeline from './HistoryTimeline.svelte';
  import StatsDialog from './StatsDialog.svelte';
  import FolderSelector from './FolderSelector.svelte';
  import PreviewConfirm from './PreviewConfirm.svelte';
  import HelpDialog from './HelpDialog.svelte';
  import { folderSelect, previewConfirm } from '$stores/modal-bridge';
  import { loadUndoHistory } from '$core/undo';
  import { loadHistory } from '$core/history';
  import {
    modals,
    onArchiveDead, onDeleteDead, closeDeadResult,
    onDedup, closeDupResult,
    onUndoConfirm, closeUndo,
    onHistoryClear, closeHistory,
    closeStats, closeHelp,
  } from '$stores/panel-modals.svelte';
</script>

{#if modals.showDeadResult}
  <DeadVideosResult
    deadVideos={modals.deadVideos}
    processing={modals.deadProcessing}
    onarchive={onArchiveDead}
    ondelete={onDeleteDead}
    onclose={closeDeadResult}
  />
{/if}

{#if modals.showDupResult}
  <DuplicatesResult
    duplicates={modals.duplicates}
    processing={modals.dupProcessing}
    ondedup={onDedup}
    onclose={closeDupResult}
  />
{/if}

{#if modals.showUndo}
  <UndoDialog
    history={loadUndoHistory()}
    onundo={onUndoConfirm}
    onclose={closeUndo}
  />
{/if}

{#if modals.showHistory}
  <HistoryTimeline
    history={loadHistory()}
    onclear={onHistoryClear}
    onclose={closeHistory}
  />
{/if}

{#if modals.showStats}
  <StatsDialog
    folders={modals.statsFolders}
    totalVideos={modals.statsTotalVideos}
    deadCount={modals.statsDeadCount}
    mode={modals.statsMode}
    onclose={closeStats}
  />
{/if}

{#if $folderSelect}
  <FolderSelector
    folders={$folderSelect.input}
    onconfirm={(ids) => folderSelect.resolve(ids)}
    onclose={() => folderSelect.reject()}
  />
{/if}

{#if $previewConfirm}
  <PreviewConfirm
    categories={$previewConfirm.input.categories}
    videos={$previewConfirm.input.videos}
    existingFolderNames={$previewConfirm.input.existingFolderNames}
    onconfirm={(data) => previewConfirm.resolve(data)}
    onclose={() => previewConfirm.reject()}
  />
{/if}

{#if modals.showHelp}
  <HelpDialog onclose={closeHelp} />
{/if}
