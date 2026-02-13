import { StorageAdapter } from './types';
import { safeJsonParseOrDefault } from '../utils/safeJson';

// Session token storage key
const SESSION_TOKEN_KEY = 'network_session_token';

/**
 * Auth status response from server
 */
export interface AuthStatusResponse {
  requires_pin: boolean;
  authenticated: boolean;
}

/**
 * PIN verification response from server
 */
export interface PinVerifyResponse {
  success: boolean;
  session_token?: string;
  error?: string;
}

/**
 * Storage adapter for browser clients connecting via network sharing.
 * Communicates with the embedded Rust server via REST API.
 */
export class NetworkClientAdapter implements StorageAdapter {
  private baseUrl: string;

  constructor() {
    // API is served from same origin as the static files
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  /**
   * Get the stored session token
   */
  getSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  }

  /**
   * Set the session token
   */
  setSessionToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  }

  /**
   * Clear the session token
   */
  clearSessionToken(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  }

  /**
   * Get common headers including session token if available
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.getSessionToken();
    if (token) {
      headers['x-session-token'] = token;
    }
    return headers;
  }

  /**
   * Check authentication status with the server
   */
  async checkAuthStatus(): Promise<AuthStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth-status`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return { requires_pin: false, authenticated: true };
      }

      return await response.json();
    } catch (error) {
      console.error('[NetworkClientAdapter] Error checking auth status:', error);
      // If we can't check, assume no PIN required
      return { requires_pin: false, authenticated: true };
    }
  }

  /**
   * Verify PIN and get session token
   */
  async verifyPin(pin: string): Promise<PinVerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.success && data.session_token) {
        this.setSessionToken(data.session_token);
      }

      return data;
    } catch (error) {
      console.error('[NetworkClientAdapter] Error verifying PIN:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  async getAll(table: string): Promise<any[]> {
    console.log(`[NetworkClientAdapter] getAll called for table: ${table}`);
    console.log(`[NetworkClientAdapter] baseUrl: ${this.baseUrl}`);
    try {
      const url = `${this.baseUrl}/api/${table}`;
      console.log(`[NetworkClientAdapter] Fetching from: ${url}`);
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      console.log(`[NetworkClientAdapter] Response status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[NetworkClientAdapter] Failed to get all from ${table}:`, response.status, errorText);
        return [];
      }

      const data = await response.json();
      console.log(`[NetworkClientAdapter] Response data:`, data);
      // Server returns { [table]: items[] }
      const items = data[table] || [];
      console.log(`[NetworkClientAdapter] Returning ${items.length} items`);
      return items;
    } catch (error) {
      console.error(`[NetworkClientAdapter] Error getting all from ${table}:`, error);
      return [];
    }
  }

  async get(table: string, id: string): Promise<any | null> {
    try {
      // Fetch all and find by ID (server doesn't have single-item endpoint)
      const items = await this.getAll(table);
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`[NetworkClientAdapter] Error getting ${id} from ${table}:`, error);
      return null;
    }
  }

  async create(table: string, id: string, data: any): Promise<void> {
    try {
      const payload = { ...data, id };

      const response = await fetch(`${this.baseUrl}/api/${table}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`[NetworkClientAdapter] Error creating in ${table}:`, error);
      throw error;
    }
  }

  async update(table: string, id: string, data: any): Promise<void> {
    // Update uses same endpoint as create (upsert)
    await this.create(table, id, data);
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${table}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`[NetworkClientAdapter] Error deleting ${id} from ${table}:`, error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/settings?key=${encodeURIComponent(key)}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        console.error(`[NetworkClientAdapter] Failed to get setting ${key}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data.data?.value ?? null;
    } catch (error) {
      console.error(`[NetworkClientAdapter] Error getting setting ${key}:`, error);
      return null;
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/settings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`[NetworkClientAdapter] Error setting ${key}:`, error);
      throw error;
    }
  }
}

// Singleton instance
let networkClientAdapterInstance: NetworkClientAdapter | null = null;

export function getNetworkClientAdapter(): StorageAdapter {
  if (!networkClientAdapterInstance) {
    networkClientAdapterInstance = new NetworkClientAdapter();
  }
  return networkClientAdapterInstance;
}
