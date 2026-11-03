import { LRUCache as VendorLRUCache } from 'lru-cache';

/**
 * Standardized LRUCache adapter backed by npm 'lru-cache'
 * Time Complexity: get: O(1), set: O(1), delete: O(1)
 */
export class LRUCache extends VendorLRUCache {
  constructor(capacity = 250, defaultTTL = null) {
    super({
      max: Math.max(1, capacity),
      ttl: defaultTTL || undefined,
    });
  }
}

export const memoryCache = new LRUCache(250);
export default LRUCache;
