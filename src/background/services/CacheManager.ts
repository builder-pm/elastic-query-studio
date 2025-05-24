// Placeholder for CacheManager

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number; // Expiry time in milliseconds from timestamp
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private defaultExpiry: number; // Default expiry in milliseconds

  constructor(defaultExpiry: number = 60 * 60 * 1000) { // Default 1 hour
    this.cache = new Map<string, CacheEntry<any>>();
    this.defaultExpiry = defaultExpiry;
    console.log("CacheManager initialized");
  }

  set<T>(key: string, value: T, expiry?: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      expiry: expiry || this.defaultExpiry,
    };
    this.cache.set(key, entry);
    console.log(`Cache set for key: ${key}`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry) {
      if (Date.now() < entry.timestamp + entry.expiry) {
        console.log(`Cache hit for key: ${key}`);
        return entry.data as T;
      } else {
        console.log(`Cache expired for key: ${key}`);
        this.cache.delete(key); // Remove expired entry
      }
    }
    console.log(`Cache miss for key: ${key}`);
    return null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`Cache deleted for key: ${key}`);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    console.log("Cache cleared");
  }

  size(): number {
    return this.cache.size;
  }
}
