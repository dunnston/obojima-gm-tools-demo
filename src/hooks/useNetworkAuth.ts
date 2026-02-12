'use client';

import { useState, useEffect, useCallback } from 'react';
import { isNetworkClient } from '@/lib/storage';
import { NetworkClientAdapter } from '@/lib/storage/networkClientAdapter';

export interface NetworkAuthState {
  isNetworkClient: boolean;
  isLoading: boolean;
  requiresPin: boolean;
  isAuthenticated: boolean;
  error: string | null;
  adapter: NetworkClientAdapter | null;
}

/**
 * Hook to manage authentication state for network clients.
 * Returns authentication status and the network adapter for PIN verification.
 */
export function useNetworkAuth(): NetworkAuthState & {
  onAuthenticated: () => void;
  recheckAuth: () => Promise<void>;
} {
  const [state, setState] = useState<NetworkAuthState>({
    isNetworkClient: false,
    isLoading: true,
    requiresPin: false,
    isAuthenticated: false,
    error: null,
    adapter: null,
  });

  const checkAuth = useCallback(async () => {
    // Check if we're running as a network client
    if (!isNetworkClient()) {
      setState({
        isNetworkClient: false,
        isLoading: false,
        requiresPin: false,
        isAuthenticated: true, // Desktop/localhost is always authenticated
        error: null,
        adapter: null,
      });
      return;
    }

    // We're a network client - create adapter and check auth status
    const adapter = new NetworkClientAdapter();

    try {
      const authStatus = await adapter.checkAuthStatus();

      setState({
        isNetworkClient: true,
        isLoading: false,
        requiresPin: authStatus.requires_pin,
        isAuthenticated: authStatus.authenticated,
        error: null,
        adapter,
      });
    } catch (error) {
      console.error('[useNetworkAuth] Error checking auth status:', error);
      setState({
        isNetworkClient: true,
        isLoading: false,
        requiresPin: false,
        isAuthenticated: true, // Assume authenticated on error to not block
        error: 'Failed to check authentication status',
        adapter,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const onAuthenticated = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
    }));
  }, []);

  const recheckAuth = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    onAuthenticated,
    recheckAuth,
  };
}
