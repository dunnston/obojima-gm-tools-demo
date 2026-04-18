'use client';

import { useState, useEffect, useRef, Component, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CogIcon, BuildingStorefrontIcon, MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon, CloudArrowDownIcon, CloudArrowUpIcon, ArchiveBoxIcon, ArrowDownTrayIcon, CheckCircleIcon, WifiIcon, ClipboardIcon, StopIcon, PlayIcon, ComputerDesktopIcon, LockClosedIcon, LockOpenIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { AppSettings, getSettings, saveSettings, resetSettings, VendingMachineSettings, NetworkSharingSettings as NetworkSharingSettingsType, getSettingsWithSync, saveSettingsWithSync, defaultNetworkSharingSettings } from '@/data/settings';
import { isTauriEnvironment } from '@/lib/storage';
import { QRCodeSVG } from 'qrcode.react';
import { combatPotions, utilityPotions, whimsyPotions } from '@/data/potions';
import { ingredients } from '@/data/ingredients';
import { magicItems } from '@/data/magicItems';
import { syncService } from '@/services/sync';
import { useUpdater } from '@/hooks/useUpdater';

// Error boundary for UpdatesSettings to prevent errors from breaking the entire Settings component
class UpdatesErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[UpdatesSettings] Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Updates</h2>
            <p className="text-slate-400">Check for and install application updates</p>
          </div>
          <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-4">
            <p className="text-amber-400 text-sm">
              <strong>Error loading updates:</strong> {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Settings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [activeTab, setActiveTab] = useState<'vendingMachine' | 'backupRestore' | 'updates' | 'networkSharing'>('vendingMachine');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const userHasEdited = useRef(false);

  // Debug: Log when Settings component renders
  useEffect(() => {
    console.log('[Settings] Component mounted - all 3 tabs should render');
  }, []);

  // Load settings with sync on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-save settings when the user makes changes
  useEffect(() => {
    if (!userHasEdited.current) return;
    saveSettingsAsync(settings);
  }, [settings]);

  const loadSettings = async () => {
    setSyncStatus('syncing');
    try {
      const syncedSettings = await getSettingsWithSync();
      if (!userHasEdited.current) {
        // Preserve local vendingMachine settings — they are the source of truth
        // since they are saved synchronously. Only merge non-vending-machine
        // settings from sync (e.g. networkSharing from another device).
        const local = getSettings();
        setSettings({
          ...syncedSettings,
          vendingMachine: local.vendingMachine,
        });
      }
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error loading settings:', error);
      setSyncStatus('error');
    }
  };

  const saveSettingsAsync = async (newSettings: AppSettings) => {
    try {
      await saveSettingsWithSync(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateVendingMachineSettings = (updates: Partial<VendingMachineSettings>) => {
    userHasEdited.current = true;
    setSettings(prev => {
      const next = {
        ...prev,
        vendingMachine: {
          ...prev.vendingMachine,
          ...updates,
        },
      };
      // Save synchronously so changes survive navigation
      saveSettings(next);
      return next;
    });
  };

  const handleReset = () => {
    if (confirm(t('settings.confirmReset'))) {
      const newSettings = resetSettings();
      setSettings(newSettings);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <CogIcon className="h-8 w-8 text-slate-400" />
          <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
          {/* Minimal sync status indicator */}
          {syncStatus === 'syncing' && (
            <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
          )}
          {syncStatus === 'error' && (
            <span className="text-xs text-amber-400">{t('settings.offline')}</span>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <p className="text-slate-400">{t('settings.subtitle')}</p>
          <button
            onClick={loadSettings}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title={t('settings.refresh')}
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="flex justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-white/10 flex gap-1">
          <button
            onClick={() => setActiveTab('vendingMachine')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'vendingMachine'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BuildingStorefrontIcon className="h-5 w-5" />
            {t('settings.vendingMachine.title')}
          </button>
          <button
            onClick={() => setActiveTab('backupRestore')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'backupRestore'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ArchiveBoxIcon className="h-5 w-5" />
            {t('settings.backupRestore.title')}
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'updates'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Updates
          </button>
          <button
            onClick={() => setActiveTab('networkSharing')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'networkSharing'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <WifiIcon className="h-5 w-5" />
            Network
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        {activeTab === 'vendingMachine' && (
          <VendingMachineSettings
            settings={settings.vendingMachine}
            onUpdate={updateVendingMachineSettings}
          />
        )}
        {activeTab === 'backupRestore' && (
          <BackupRestoreSettings />
        )}
        {activeTab === 'updates' && (
          <UpdatesErrorBoundary>
            <UpdatesSettings />
          </UpdatesErrorBoundary>
        )}
        {activeTab === 'networkSharing' && (
          <NetworkSharingSettings />
        )}
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          {t('settings.resetAllSettings')}
        </button>
      </div>
    </div>
  );
}

function BackupRestoreSettings() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'restoring' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleCreateBackup = async () => {
    setBackupStatus('creating');
    setStatusMessage('');

    try {
      const result = await syncService.createBackup();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create backup');
      }

      const backupData = result.data;

      // Create and download the file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `obojima-backup-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupStatus('success');
      setStatusMessage(t('settings.backupRestore.backupSuccess'));
    } catch (error) {
      console.error('Backup error:', error);
      setBackupStatus('error');
      setStatusMessage(t('settings.backupRestore.backupError'));
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Confirm before restore
    if (!confirm(t('settings.backupRestore.confirmRestore'))) {
      event.target.value = '';
      return;
    }

    setRestoreStatus('restoring');
    setStatusMessage('');

    try {
      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);

      // Validate it's a backup file
      if (!backupData.version || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      const result = await syncService.restoreBackup(backupData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to restore backup');
      }

      setRestoreStatus('success');
      setStatusMessage(t('settings.backupRestore.restoreSuccess', { count: result.data?.restoredTables?.length || 0 }));

      // Refresh the page after a brief delay to load restored data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Restore error:', error);
      setRestoreStatus('error');
      setStatusMessage(t('settings.backupRestore.restoreError'));
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{t('settings.backupRestore.subtitle')}</h2>
        <p className="text-slate-400">{t('settings.backupRestore.description')}</p>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-lg text-center ${
          backupStatus === 'success' || restoreStatus === 'success'
            ? 'bg-green-600/20 text-green-400 border border-green-600/30'
            : backupStatus === 'error' || restoreStatus === 'error'
            ? 'bg-red-600/20 text-red-400 border border-red-600/30'
            : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
        }`}>
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Backup */}
        <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CloudArrowDownIcon className="h-8 w-8 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">{t('settings.backupRestore.createBackup')}</h3>
          </div>
          <p className="text-slate-400 text-sm">
            {t('settings.backupRestore.createBackupDescription')}
          </p>
          <button
            onClick={handleCreateBackup}
            disabled={backupStatus === 'creating'}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            {backupStatus === 'creating' ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                {t('settings.backupRestore.creating')}
              </>
            ) : (
              <>
                <CloudArrowDownIcon className="h-5 w-5" />
                {t('settings.backupRestore.downloadBackup')}
              </>
            )}
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CloudArrowUpIcon className="h-8 w-8 text-amber-400" />
            <h3 className="text-xl font-semibold text-white">{t('settings.backupRestore.restoreBackup')}</h3>
          </div>
          <p className="text-slate-400 text-sm">
            {t('settings.backupRestore.restoreBackupDescription')}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleRestoreClick}
            disabled={restoreStatus === 'restoring'}
            className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            {restoreStatus === 'restoring' ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                {t('settings.backupRestore.restoring')}
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-5 w-5" />
                {t('settings.backupRestore.uploadBackup')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-4">
        <p className="text-amber-400 text-sm">
          <strong>{t('settings.backupRestore.warningTitle')}</strong> {t('settings.backupRestore.warningText')}
        </p>
      </div>
    </div>
  );
}

const FALLBACK_VERSION = '0.4.1';

function UpdatesSettings() {
  const updater = useUpdater();
  const [isTauri, setIsTauri] = useState(false);
  const [tauriChecked, setTauriChecked] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(FALLBACK_VERSION);

  // Check for Tauri environment and get version
  useEffect(() => {
    const checkTauri = () => {
      if (typeof window === 'undefined') return false;
      return '__TAURI_IPC__' in window || '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
    };

    // Check multiple times to ensure Tauri has initialized
    let attempts = 0;
    const check = async () => {
      if (checkTauri()) {
        setIsTauri(true);
        setTauriChecked(true);
        // Get version from Tauri
        try {
          const { getVersion } = await import('@tauri-apps/api/app');
          const version = await getVersion();
          setCurrentVersion(version);
        } catch (error) {
          console.error('Failed to get app version:', error);
        }
        return true;
      }
      return false;
    };

    check().then(found => {
      if (found) return;

      const interval = setInterval(async () => {
        attempts++;
        const found = await check();
        if (found || attempts >= 20) {
          setTauriChecked(true);
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    });
  }, []);

  const handleCheckForUpdates = async () => {
    await updater.checkForUpdate();
  };

  // Show loading state while checking for Tauri
  if (!tauriChecked) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Updates</h2>
          <p className="text-slate-400">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show message for web users
  if (!isTauri) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Updates</h2>
          <p className="text-slate-400">Check for and install application updates</p>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-400 mb-1">Current Version</p>
          <p className="text-3xl font-mono text-white">v{currentVersion}</p>
        </div>

        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm">
            <strong>Desktop App Required:</strong> Automatic updates are only available in the desktop application.
            Download the desktop app from GitHub to receive automatic updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Updates</h2>
        <p className="text-slate-400">Check for and install application updates</p>
      </div>

      {/* Current Version */}
      <div className="bg-slate-700/30 rounded-xl p-6 text-center">
        <p className="text-sm text-slate-400 mb-1">Current Version</p>
        <p className="text-3xl font-mono text-white">v{currentVersion}</p>
      </div>

      {/* Update Status */}
      {updater.updateAvailable && updater.updateInfo && (
        <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ArrowDownTrayIcon className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="font-medium text-emerald-400">Update Available!</p>
              <p className="text-sm text-slate-300">Version {updater.updateInfo.version} is ready to download.</p>
            </div>
          </div>
        </div>
      )}

      {/* Up to date message */}
      {updater.isUpToDate && !updater.updateAvailable && (
        <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="font-medium text-emerald-400">You're up to date!</p>
              <p className="text-sm text-slate-300">
                Obojima GM Tools v{currentVersion} is the latest version.
                {updater.lastChecked && (
                  <span className="text-slate-400"> Last checked: {updater.lastChecked.toLocaleString()}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {updater.error && (
        <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-4">
          <p className="text-amber-400 text-sm">{updater.error}</p>
        </div>
      )}

      {/* Check for Updates */}
      <div className="space-y-4">
        <button
          onClick={handleCheckForUpdates}
          disabled={updater.isChecking}
          className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-3"
        >
          {updater.isChecking ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              Checking for updates...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-5 w-5" />
              Check for Updates
            </>
          )}
        </button>
      </div>

      {/* Download Progress */}
      {updater.isDownloading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Downloading update...</span>
            <span className="text-emerald-400">{updater.downloadProgress}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${updater.downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Install Update Button */}
      {updater.updateAvailable && !updater.isDownloading && (
        <button
          onClick={updater.downloadAndInstall}
          className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-3"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Download and Install Update
        </button>
      )}

      {/* Info */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <p className="text-slate-400 text-sm">
          Updates are checked automatically when the app starts and every 6 hours.
          We recommend creating a backup before updating.
        </p>
      </div>
    </div>
  );
}

interface ServerInfo {
  ip: string;
  port: number;
  url: string;
}

interface ServerStatus {
  running: boolean;
  info: ServerInfo | null;
  connected_clients: number;
}

function NetworkSharingSettings() {
  const [isTauri, setIsTauri] = useState(false);
  const [tauriChecked, setTauriChecked] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [port, setPort] = useState(3001);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);

  // PIN protection state
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Check for Tauri environment
  useEffect(() => {
    const checkTauri = () => {
      if (typeof window === 'undefined') return false;
      return isTauriEnvironment();
    };

    let attempts = 0;
    const check = () => {
      if (checkTauri()) {
        setIsTauri(true);
        setTauriChecked(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    const interval = setInterval(() => {
      attempts++;
      if (check() || attempts >= 20) {
        setTauriChecked(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Poll server status when in Tauri
  useEffect(() => {
    if (!isTauri) return;

    const checkStatus = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const status = await invoke<ServerStatus>('get_server_status');
        setServerStatus(status);
      } catch (err) {
        console.error('Failed to get server status:', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [isTauri]);

  // Validate PIN format
  const validatePin = (value: string): boolean => {
    if (!pinEnabled) return true;
    if (value.length < 4 || value.length > 6) {
      setPinError('PIN must be 4-6 digits');
      return false;
    }
    if (!/^\d+$/.test(value)) {
      setPinError('PIN must contain only numbers');
      return false;
    }
    setPinError(null);
    return true;
  };

  const handleStartServer = async () => {
    // Validate PIN if enabled
    if (pinEnabled && !validatePin(pin)) {
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const info = await invoke<ServerInfo>('start_network_server', {
        port,
        pin: pinEnabled ? pin : null,
      });
      setServerStatus({
        running: true,
        info,
        connected_clients: 0,
      });
    } catch (err: any) {
      console.error('Failed to start server:', err);
      setError(err.toString());
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopServer = async () => {
    setIsStopping(true);
    setError(null);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('stop_network_server');
      setServerStatus({
        running: false,
        info: null,
        connected_clients: 0,
      });
    } catch (err: any) {
      console.error('Failed to stop server:', err);
      setError(err.toString());
    } finally {
      setIsStopping(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Loading state
  if (!tauriChecked) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Network Sharing</h2>
          <p className="text-slate-400">Initializing...</p>
        </div>
      </div>
    );
  }

  // Non-Tauri environment
  if (!isTauri) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Network Sharing</h2>
          <p className="text-slate-400">Share your session with other devices on your local network</p>
        </div>

        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm">
            <strong>Desktop App Required:</strong> Network sharing is only available in the desktop application.
            Download the desktop app to share your session with other devices.
          </p>
        </div>
      </div>
    );
  }

  const isRunning = serverStatus?.running ?? false;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Network Sharing</h2>
        <p className="text-slate-400">Share your session with other devices on your local network</p>
      </div>

      {/* Server Status */}
      <div className={`rounded-xl p-6 text-center ${
        isRunning
          ? 'bg-emerald-600/10 border border-emerald-600/30'
          : 'bg-slate-700/30'
      }`}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className={`text-lg font-medium ${isRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isRunning ? 'Server Running' : 'Server Stopped'}
          </span>
          {isRunning && pinEnabled && (
            <span className="flex items-center gap-1 text-sm text-amber-400">
              <LockClosedIcon className="h-4 w-4" />
              PIN Protected
            </span>
          )}
        </div>

        {isRunning && serverStatus?.info && (
          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-3"
              >
                <QrCodeIcon className="h-5 w-5" />
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </button>
              {showQR && (
                <div className="bg-white p-4 rounded-xl inline-block">
                  <QRCodeSVG
                    value={serverStatus.info.url}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Access URL</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-xl font-mono text-white bg-slate-700/50 px-4 py-2 rounded-lg">
                  {serverStatus.info.url}
                </code>
                <button
                  onClick={() => copyToClipboard(serverStatus.info!.url)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Copy URL"
                >
                  {copied ? (
                    <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ComputerDesktopIcon className="h-5 w-5 text-slate-400" />
                <span className="text-slate-300">
                  {serverStatus.connected_clients} connected client{serverStatus.connected_clients !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Configuration (only when stopped) */}
      {!isRunning && (
        <div className="bg-slate-700/30 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-medium text-white">Configuration</h3>

          {/* Port Setting */}
          <div className="flex items-center gap-4">
            <label className="text-slate-400 w-24">Port:</label>
            <input
              type="number"
              min="1024"
              max="65535"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value) || 3001)}
              className="w-24 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-center"
            />
            <span className="text-slate-500 text-sm">Default: 3001</span>
          </div>

          {/* PIN Protection */}
          <div className="border-t border-slate-600 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {pinEnabled ? (
                  <LockClosedIcon className="h-5 w-5 text-amber-400" />
                ) : (
                  <LockOpenIcon className="h-5 w-5 text-slate-400" />
                )}
                <div>
                  <h4 className="text-white font-medium">PIN Protection</h4>
                  <p className="text-slate-400 text-sm">Require a PIN to access from other devices</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPinEnabled(!pinEnabled);
                  if (!pinEnabled) setPin('');
                  setPinError(null);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  pinEnabled ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    pinEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {pinEnabled && (
              <div className="ml-8 space-y-2">
                <div className="flex items-center gap-4">
                  <label className="text-slate-400">PIN:</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPin(value);
                      if (value) validatePin(value);
                    }}
                    placeholder="4-6 digits"
                    className="w-32 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-center tracking-widest"
                  />
                </div>
                {pinError && (
                  <p className="text-red-400 text-sm">{pinError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start/Stop Button */}
      <div className="flex justify-center">
        {isRunning ? (
          <button
            onClick={handleStopServer}
            disabled={isStopping}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors font-medium flex items-center gap-3"
          >
            {isStopping ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <StopIcon className="h-5 w-5" />
                Stop Sharing
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleStartServer}
            disabled={isStarting || (pinEnabled && (!pin || pin.length < 4))}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white rounded-lg transition-all font-medium flex items-center gap-3"
          >
            {isStarting ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5" />
                Start Sharing
              </>
            )}
          </button>
        )}
      </div>

      {/* How to Use */}
      <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-medium text-white">How to Use</h3>
        <ol className="space-y-3 text-slate-300 text-sm list-decimal list-inside">
          <li>Configure port and optional PIN protection</li>
          <li>Click "Start Sharing" to begin broadcasting</li>
          <li>On another device, scan the QR code or enter the URL</li>
          {pinEnabled && <li>Enter the PIN when prompted on the other device</li>}
          <li>Changes made on any device will sync to all connected devices</li>
        </ol>
      </div>

      {/* Security Note */}
      <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-4">
        <p className="text-amber-400 text-sm">
          <strong>Note:</strong> Network sharing is only accessible to devices on your local network.
          {pinEnabled ? ' PIN protection adds an extra layer of security.' : ' Consider enabling PIN protection for additional security.'}
        </p>
      </div>
    </div>
  );
}

interface VendingMachineSettingsProps {
  settings: VendingMachineSettings;
  onUpdate: (updates: Partial<VendingMachineSettings>) => void;
}

function VendingMachineSettings({ settings, onUpdate }: VendingMachineSettingsProps) {
  const { t } = useTranslation();
  const [excludeSearch, setExcludeSearch] = useState({
    potions: '',
    ingredients: '',
    magicItems: '',
  });
  const [includeSearch, setIncludeSearch] = useState({
    potions: '',
    ingredients: '',
    magicItems: '',
  });

  const [customPotions, setCustomPotions] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await syncService.syncWithFallback('user-potions', 'modifiedPotions');
        if (!cancelled && Array.isArray(data)) setCustomPotions(data);
      } catch (error) {
        console.error('Error loading custom potions:', error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const allPotions = [...combatPotions, ...utilityPotions, ...whimsyPotions, ...customPotions];

  const handleCategoryChange = (category: keyof VendingMachineSettings['categories'], enabled: boolean) => {
    onUpdate({
      categories: {
        ...settings.categories,
        [category]: enabled,
      },
    });
  };

  const handleQuantityChange = (
    type: 'potionQuantities' | 'ingredientQuantities' | 'magicItemQuantities',
    rarity: string,
    value: number
  ) => {
    onUpdate({
      [type]: {
        ...settings[type],
        [rarity]: Math.max(0, value),
      },
    });
  };

  const toggleExcludeItem = (category: keyof VendingMachineSettings['excludedItems'], itemName: string) => {
    const currentExcluded = settings.excludedItems[category];
    const isExcluded = currentExcluded.includes(itemName);

    onUpdate({
      excludedItems: {
        ...settings.excludedItems,
        [category]: isExcluded
          ? currentExcluded.filter(name => name !== itemName)
          : [...currentExcluded, itemName],
      },
    });
  };

  const toggleIncludeItem = (category: keyof VendingMachineSettings['includedItems'], itemName: string) => {
    const currentIncluded = settings.includedItems?.[category] || [];
    const isIncluded = currentIncluded.includes(itemName);

    onUpdate({
      includedItems: {
        ...(settings.includedItems || { potions: [], ingredients: [], magicItems: [] }),
        [category]: isIncluded
          ? currentIncluded.filter(name => name !== itemName)
          : [...currentIncluded, itemName],
      },
    });
  };

  const getFilteredItems = (category: 'potions' | 'ingredients' | 'magicItems', searchTerm: string) => {
    let items: any[] = [];
    
    switch (category) {
      case 'potions':
        items = allPotions;
        break;
      case 'ingredients':
        items = ingredients;
        break;
      case 'magicItems':
        items = magicItems;
        break;
    }
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{t('settings.vendingMachine.subtitle')}</h2>
        <p className="text-slate-400">{t('settings.vendingMachine.description')}</p>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">{t('settings.vendingMachine.categories')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(settings.categories).map(([category, enabled]) => (
            <div key={category} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium capitalize">{category}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => handleCategoryChange(category as keyof VendingMachineSettings['categories'], e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Potion & Ingredient Quantities */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">{t('settings.vendingMachine.potionQuantities')}</h3>
            <div className="space-y-3">
              {Object.entries(settings.potionQuantities).map(([rarity, quantity]) => (
                <div key={rarity} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                  <span className="text-white capitalize">{rarity}</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={quantity}
                    onChange={(e) => handleQuantityChange('potionQuantities', rarity, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">{t('settings.vendingMachine.ingredientQuantities')}</h3>
            <div className="space-y-3">
              {Object.entries(settings.ingredientQuantities).map(([rarity, quantity]) => (
                <div key={rarity} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                  <span className="text-white capitalize">{rarity}</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={quantity}
                    onChange={(e) => handleQuantityChange('ingredientQuantities', rarity, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Magic Item Quantities */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">{t('settings.vendingMachine.magicItemQuantities')}</h3>
          <div className="space-y-3">
            {Object.entries(settings.magicItemQuantities).map(([type, quantity]) => (
              <div key={type} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                <span className="text-white capitalize">{type === 'wondrous' ? t('settings.vendingMachine.wondrousItems') : type}</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={quantity}
                  onChange={(e) => handleQuantityChange('magicItemQuantities', type, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exclude Lists */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">{t('settings.vendingMachine.excludeItems')}</h3>
        <p className="text-slate-400">{t('settings.vendingMachine.excludeItemsDescription')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['potions', 'ingredients', 'magicItems'] as const).map((category) => (
            <ExcludeItemsSection
              key={category}
              category={category}
              items={getFilteredItems(category, excludeSearch[category])}
              excludedItems={settings.excludedItems[category]}
              searchTerm={excludeSearch[category]}
              onSearchChange={(term) => setExcludeSearch(prev => ({ ...prev, [category]: term }))}
              onToggleExclude={(itemName) => toggleExcludeItem(category, itemName)}
            />
          ))}
        </div>
      </div>

      {/* Include Lists */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">{t('settings.vendingMachine.includeItems')}</h3>
        <p className="text-slate-400">{t('settings.vendingMachine.includeItemsDescription')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['potions', 'ingredients', 'magicItems'] as const).map((category) => (
            <IncludeItemsSection
              key={category}
              category={category}
              items={getFilteredItems(category, includeSearch[category])}
              includedItems={settings.includedItems?.[category] || []}
              searchTerm={includeSearch[category]}
              onSearchChange={(term) => setIncludeSearch(prev => ({ ...prev, [category]: term }))}
              onToggleInclude={(itemName) => toggleIncludeItem(category, itemName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ExcludeItemsSectionProps {
  category: 'potions' | 'ingredients' | 'magicItems';
  items: any[];
  excludedItems: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleExclude: (itemName: string) => void;
}

function ExcludeItemsSection({ 
  category, 
  items, 
  excludedItems, 
  searchTerm, 
  onSearchChange, 
  onToggleExclude 
}: ExcludeItemsSectionProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-700/30 rounded-lg p-4">
      <h4 className="text-lg font-medium text-white mb-3 capitalize">{category}</h4>
      
      {/* Search */}
      <div className="relative mb-3">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={t('settings.vendingMachine.searchPlaceholder', { category })}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-orange-400"
        />
      </div>

      {/* Items List */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {items.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            className="flex items-center justify-between p-2 rounded bg-slate-600/50 hover:bg-slate-600/70 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm truncate block">{item.name}</span>
              <span className="text-slate-400 text-xs">{item.rarity}</span>
            </div>
            <button
              onClick={() => onToggleExclude(item.name)}
              className={`ml-2 p-1 rounded transition-colors ${
                excludedItems.includes(item.name)
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-500 hover:bg-slate-400 text-slate-200'
              }`}
            >
              {excludedItems.includes(item.name) ? (
                <XMarkIcon className="h-4 w-4" />
              ) : (
                <span className="block w-4 h-4 text-xs font-bold">+</span>
              )}
            </button>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-4 text-slate-400 text-sm">
            {t('settings.vendingMachine.noItemsFound')}
          </div>
        )}
      </div>

      {/* Excluded count */}
      {excludedItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-600">
          <span className="text-red-400 text-sm">
            {t('settings.vendingMachine.itemsExcluded', {
              count: excludedItems.length,
              plural: excludedItems.length !== 1 ? 's' : ''
            })}
          </span>
        </div>
      )}
    </div>
  );
}

interface IncludeItemsSectionProps {
  category: 'potions' | 'ingredients' | 'magicItems';
  items: any[];
  includedItems: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleInclude: (itemName: string) => void;
}

function IncludeItemsSection({
  category,
  items,
  includedItems,
  searchTerm,
  onSearchChange,
  onToggleInclude
}: IncludeItemsSectionProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-700/30 rounded-lg p-4 border border-emerald-600/20">
      <h4 className="text-lg font-medium text-white mb-3 capitalize">{category}</h4>

      {/* Search */}
      <div className="relative mb-3">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={t('settings.vendingMachine.searchPlaceholder', { category })}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400"
        />
      </div>

      {/* Items List */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {items.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            className="flex items-center justify-between p-2 rounded bg-slate-600/50 hover:bg-slate-600/70 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm truncate block">{item.name}</span>
              <span className="text-slate-400 text-xs">{item.rarity}</span>
            </div>
            <button
              onClick={() => onToggleInclude(item.name)}
              className={`ml-2 p-1 rounded transition-colors ${
                includedItems.includes(item.name)
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-500 hover:bg-slate-400 text-slate-200'
              }`}
            >
              {includedItems.includes(item.name) ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <span className="block w-4 h-4 text-xs font-bold">+</span>
              )}
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-4 text-slate-400 text-sm">
            {t('settings.vendingMachine.noItemsFound')}
          </div>
        )}
      </div>

      {/* Included count */}
      {includedItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-600">
          <span className="text-emerald-400 text-sm">
            {t('settings.vendingMachine.itemsIncluded', {
              count: includedItems.length,
              plural: includedItems.length !== 1 ? 's' : ''
            })}
          </span>
        </div>
      )}
    </div>
  );
}