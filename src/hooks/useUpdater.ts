import { useState, useCallback } from 'react';
import { isTauriEnvironment } from '@/lib/storage';

export interface UpdateInfo {
  version: string;
  date: string;
  body: string;
}

export interface UpdaterState {
  isChecking: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  updateAvailable: boolean;
  updateInfo: UpdateInfo | null;
  error: string | null;
  lastChecked: Date | null;
  isUpToDate: boolean;
}

export function useUpdater() {
  const [state, setState] = useState<UpdaterState>({
    isChecking: false,
    isDownloading: false,
    downloadProgress: 0,
    updateAvailable: false,
    updateInfo: null,
    error: null,
    lastChecked: null,
    isUpToDate: false,
  });

  const checkForUpdate = useCallback(async (): Promise<UpdateInfo | null> => {
    if (!isTauriEnvironment()) {
      return null;
    }

    setState(prev => ({ ...prev, isChecking: true, error: null, isUpToDate: false }));

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (update) {
        const updateInfo: UpdateInfo = {
          version: update.version,
          date: update.date || new Date().toISOString(),
          body: update.body || 'No release notes available.',
        };
        setState(prev => ({
          ...prev,
          isChecking: false,
          updateAvailable: true,
          updateInfo,
          lastChecked: new Date(),
          isUpToDate: false,
        }));
        return updateInfo;
      } else {
        // No update available means we're up to date
        setState(prev => ({
          ...prev,
          isChecking: false,
          updateAvailable: false,
          updateInfo: null,
          lastChecked: new Date(),
          isUpToDate: true,
        }));
        return null;
      }
    } catch (error) {
      // Log the actual error for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('[Updater] Check error:', errorMessage);

      // Check if this is a "no release" error vs a real network error
      // Common patterns when no GitHub release exists yet:
      // - 404 errors when latest.json doesn't exist
      // - JSON parsing errors
      // - "could not find" messages
      // - Network errors for the release endpoint
      const lowerError = errorMessage.toLowerCase();
      const isNoReleaseError =
        lowerError.includes('404') ||
        lowerError.includes('not found') ||
        lowerError.includes('no updates') ||
        lowerError.includes('could not find') ||
        lowerError.includes('no release') ||
        lowerError.includes('json') ||
        lowerError.includes('parse') ||
        lowerError.includes('unexpected token') ||
        lowerError.includes('failed to fetch') ||
        lowerError.includes('network') ||
        // Tauri-specific error patterns
        lowerError.includes('endpoint') ||
        lowerError.includes('manifest') ||
        lowerError.includes('latest.json');

      if (isNoReleaseError) {
        // Treat "no release found" as "up to date"
        console.log('[Updater] Treating as up-to-date (no release published yet)');
        setState(prev => ({
          ...prev,
          isChecking: false,
          updateAvailable: false,
          isUpToDate: true,
          lastChecked: new Date(),
          error: null,
        }));
      } else {
        // Real error - show it to the user
        console.log('[Updater] Treating as real error');
        setState(prev => ({
          ...prev,
          isChecking: false,
          error: 'Unable to check for updates. Please try again later.',
          lastChecked: new Date(),
        }));
      }
      return null;
    }
  }, []);

  const downloadAndInstall = useCallback(async (): Promise<boolean> => {
    if (!isTauriEnvironment()) {
      return false;
    }

    setState(prev => ({ ...prev, isDownloading: true, downloadProgress: 0, error: null }));

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const { relaunch } = await import('@tauri-apps/plugin-process');

      const update = await check();

      if (!update) {
        setState(prev => ({ ...prev, isDownloading: false, error: 'No update available' }));
        return false;
      }

      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            setState(prev => ({ ...prev, downloadProgress: 0 }));
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            const progress = contentLength > 0 ? Math.round((downloaded / contentLength) * 100) : 0;
            setState(prev => ({ ...prev, downloadProgress: progress }));
            break;
          case 'Finished':
            setState(prev => ({ ...prev, downloadProgress: 100 }));
            break;
        }
      });

      // Relaunch the app after successful install
      await relaunch();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download update';
      setState(prev => ({
        ...prev,
        isDownloading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const dismissUpdate = useCallback(() => {
    setState(prev => ({
      ...prev,
      updateAvailable: false,
      updateInfo: null,
    }));
  }, []);

  return {
    ...state,
    checkForUpdate,
    downloadAndInstall,
    clearError,
    dismissUpdate,
  };
}
