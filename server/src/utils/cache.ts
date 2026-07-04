export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, { value: any; expiresAt: number }>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Fetch item from cache. Returns null if expired or missing.
   */
  public get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Set item in cache with TTL. Default is 300 seconds (5 mins).
   */
  public set(key: string, value: any, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Invalidate a single key.
   */
  public del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Flush all items in cache.
   */
  public flush(): void {
    this.cache.clear();
  }
}

export const cache = CacheService.getInstance();
export default cache;
