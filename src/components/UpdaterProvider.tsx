'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useUpdater, UpdateInfo } from '@/hooks/useUpdater';
import { isTauriEnvironment } from '@/lib/storage';
import UpdateBanner from './UpdateBanner';
import UpdateModal from './UpdateModal';

interface UpdaterContextValue {
  currentVersion: string;
  updateAvailable: boolean;
  updateInfo: UpdateInfo | null;
  isChecking: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  error: string | null;
  checkForUpdate: () => Promise<UpdateInfo | null>;
  downloadAndInstall: () => Promise<boolean>;
  dismissUpdate: () => void;
  openUpdateModal: () => void;
}

const UpdaterContext = createContext<UpdaterContextValue | null>(null);

const CURRENT_VERSION = '0.1.3';
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const INITIAL_CHECK_DELAY_MS = 5000; // 5 seconds after app start

interface UpdaterProviderProps {
  children: ReactNode;
}

export function UpdaterProvider({ children }: UpdaterProviderProps) {
  const updater = useUpdater();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check for updates on mount (with delay) and periodically
  useEffect(() => {
    if (!isTauriEnvironment()) {
      return;
    }

    // Initial check after delay
    const initialTimeout = setTimeout(() => {
      updater.checkForUpdate();
    }, INITIAL_CHECK_DELAY_MS);

    // Periodic checks
    const intervalId = setInterval(() => {
      if (!updater.isChecking && !updater.isDownloading) {
        updater.checkForUpdate();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    updater.dismissUpdate();
  }, [updater]);

  const openUpdateModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeUpdateModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const contextValue: UpdaterContextValue = {
    currentVersion: CURRENT_VERSION,
    updateAvailable: updater.updateAvailable,
    updateInfo: updater.updateInfo,
    isChecking: updater.isChecking,
    isDownloading: updater.isDownloading,
    downloadProgress: updater.downloadProgress,
    error: updater.error,
    checkForUpdate: updater.checkForUpdate,
    downloadAndInstall: updater.downloadAndInstall,
    dismissUpdate: handleDismiss,
    openUpdateModal,
  };

  return (
    <UpdaterContext.Provider value={contextValue}>
      {children}

      {/* Show banner when update is available and not dismissed */}
      {updater.updateAvailable && !dismissed && !showModal && (
        <UpdateBanner
          version={updater.updateInfo?.version || 'New version'}
          onDismiss={handleDismiss}
          onClick={openUpdateModal}
        />
      )}

      {/* Update modal */}
      {showModal && (
        <UpdateModal
          currentVersion={CURRENT_VERSION}
          updateInfo={updater.updateInfo}
          isDownloading={updater.isDownloading}
          downloadProgress={updater.downloadProgress}
          error={updater.error}
          onClose={closeUpdateModal}
          onUpdate={updater.downloadAndInstall}
        />
      )}
    </UpdaterContext.Provider>
  );
}

export function useUpdaterContext() {
  const context = useContext(UpdaterContext);
  if (!context) {
    throw new Error('useUpdaterContext must be used within an UpdaterProvider');
  }
  return context;
}

export default UpdaterProvider;
