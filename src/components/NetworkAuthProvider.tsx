'use client';

import { ReactNode } from 'react';
import { useNetworkAuth } from '@/hooks/useNetworkAuth';
import PinEntry from './PinEntry';

interface NetworkAuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component that handles network client authentication.
 * Shows PIN entry screen when required for network clients.
 */
export default function NetworkAuthProvider({ children }: NetworkAuthProviderProps) {
  const { isNetworkClient, isLoading, requiresPin, isAuthenticated, adapter, onAuthenticated } = useNetworkAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Connecting...</p>
        </div>
      </div>
    );
  }

  // Show PIN entry for network clients that need authentication
  if (isNetworkClient && requiresPin && !isAuthenticated && adapter) {
    return <PinEntry onAuthenticated={onAuthenticated} adapter={adapter} />;
  }

  // Render children normally
  return <>{children}</>;
}
