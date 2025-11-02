// Cache utility for storing generated content
const CACHE_PREFIX = 'eduseva_';
const CACHE_KEYS = {
  FLASHCARDS: 'flashcards',
  QUIZ: 'quiz',
  MINDMAP: 'mindmap',
  SUMMARY: 'summary',
  QUESTION_PAPER: 'question_paper',
  PODCAST: 'podcast',
  CHAT_HISTORY: 'chat_history',
} as const;

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn?: number; // in milliseconds
}

class CacheManager {
  private getKey(key: CacheKey): string {
    return `${CACHE_PREFIX}${key}`;
  }

  set<T>(key: CacheKey, data: T, expiresIn?: number): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  get<T>(key: CacheKey): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      
      // Check if expired
      if (cacheItem.expiresIn) {
        const isExpired = Date.now() - cacheItem.timestamp > cacheItem.expiresIn;
        if (isExpired) {
          this.remove(key);
          return null;
        }
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  remove(key: CacheKey): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  clear(): void {
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        this.remove(key as CacheKey);
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  has(key: CacheKey): boolean {
    return this.get(key) !== null;
  }
}

export const cache = new CacheManager();
export { CACHE_KEYS };
