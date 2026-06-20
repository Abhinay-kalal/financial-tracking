import { createClient } from 'redis';
import { config } from './index';

let redisClient: ReturnType<typeof createClient> | null = null;
let isConnected = false;
let redisErrorLogged = false;

if (config.redisUrl) {
  redisClient = createClient({
    url: config.redisUrl,
    socket: {
      // Stop retrying after 1 attempt — avoids console spam when Redis is not installed
      reconnectStrategy: () => false,
    },
  });

  redisClient.on('error', (err) => {
    if (!redisErrorLogged) {
      console.warn('[Redis] Not available — running with in-memory fallback. Start Redis to enable caching.');
      console.warn('[Redis] Error:', err.code ?? err.message);
      redisErrorLogged = true;
    }
    isConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected ✓');
    isConnected = true;
  });

  redisClient.connect().catch(() => {
    // Error already handled above
    redisClient = null;
  });
}

// Simple in-memory fallback store
const memoryStore = new Map<string, { value: string; expiresAt: number }>();

export const cache = {
  get: async (key: string): Promise<string | null> => {
    if (redisClient && isConnected) {
      try {
        return await redisClient.get(key);
      } catch {
        // Fallback to memory if redis fails
      }
    }
    const item = memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return item.value;
  },
  setEx: async (key: string, seconds: number, value: string): Promise<void> => {
    if (redisClient && isConnected) {
      try {
        await redisClient.setEx(key, seconds, value);
        return;
      } catch (e) {
        console.warn('Failed to set cache in Redis, falling back to memory:', e);
      }
    }
    memoryStore.set(key, {
      value,
      expiresAt: Date.now() + seconds * 1000,
    });
  },
  del: async (key: string): Promise<void> => {
    if (redisClient && isConnected) {
      try {
        await redisClient.del(key);
        return;
      } catch (e) {
        console.warn('Failed to delete cache in Redis, falling back to memory:', e);
      }
    }
    memoryStore.delete(key);
  }
};
