'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { UpdateInfo } from '@/hooks/useUpdater';
import { syncService } from '@/services/sync';

interface UpdateModalProps {
  currentVersion: string;
  updateInfo: UpdateInfo | null;
  isDownloading: boolean;
  downloadProgress: number;
  error: string | null;
  onClose: () => void;
  onUpdate: () => Promise<boolean>;
}

export default function UpdateModal({
  currentVersion,
  updateInfo,
  isDownloading,
  downloadProgress,
  error,
  onClose,
  onUpdate,
}: UpdateModalProps) {
  const [backupStatus, setBackupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [backupError, setBackupError] = useState<string | null>(null);

  const handleBackup = async () => {
    setBackupStatus('creating');
    setBackupError(null);

    try {
      const result = await syncService.createBackup();

      if (result.success && result.data) {
        // Trigger file download
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `obojima-backup-before-${updateInfo?.version || 'update'}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setBackupStatus('success');
      } else {
        setBackupStatus('error');
        setBackupError(result.error || 'Failed to create backup');
      }
    } catch (err) {
      setBackupStatus('error');
      setBackupError(err instanceof Error ? err.message : 'Failed to create backup');
    }
  };

  const handleUpdate = async () => {
    await onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <ArrowDownTrayIcon className="h-6 w-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Update Available</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Version Info */}
          <div className="flex items-center justify-center gap-4 text-center">
            <div>
              <p className="text-sm text-slate-400">Current</p>
              <p className="text-lg font-mono text-slate-300">v{currentVersion}</p>
            </div>
            <div className="text-2xl text-slate-500">→</div>
            <div>
              <p className="text-sm text-emerald-400">New</p>
              <p className="text-lg font-mono text-emerald-400">v{updateInfo?.version}</p>
            </div>
          </div>

          {/* Release Notes */}
          {updateInfo?.body && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">Release Notes</h4>
              <div className="bg-slate-700/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{updateInfo.body}</p>
              </div>
            </div>
          )}

          {/* Backup Warning */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">Backup Recommended</p>
                <p className="text-sm text-slate-400 mt-1">
                  We recommend creating a backup of your data before updating.
                </p>
              </div>
            </div>
          </div>

          {/* Backup Button */}
          <button
            onClick={handleBackup}
            disabled={backupStatus === 'creating' || isDownloading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              backupStatus === 'success'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50'
            }`}
          >
            {backupStatus === 'creating' ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Creating Backup...
              </>
            ) : backupStatus === 'success' ? (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Backup Downloaded
              </>
            ) : (
              <>
                <ArchiveBoxIcon className="h-5 w-5" />
                Create Backup
              </>
            )}
          </button>

          {backupError && (
            <p className="text-sm text-red-400">{backupError}</p>
          )}

          {/* Download Progress */}
          {isDownloading && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Downloading update...</span>
                <span className="text-emerald-400">{downloadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Later
          </button>
          <button
            onClick={handleUpdate}
            disabled={isDownloading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isDownloading ? 'Updating...' : 'Update Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
