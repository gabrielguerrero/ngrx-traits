export type CacheKey = string | (string | object)[];

export interface CacheData {
  value: any;
  date: number;
  invalid: boolean;
  hitCount: number;
}
export interface CacheKeys {
  keys?: { [key: string]: CacheKeys };
  data?: CacheData;
}

export type CacheState = CacheKeys;

export interface CacheConfig {
  expires: number;
}
function hash(key: string | object): string {
  return JSON.stringify(key, (_, val) =>
    typeof val == 'object'
      ? Object.keys(val)
          .sort()
          .reduce((result, k) => {
            result[k] = val[k];
            return result;
          }, {} as any)
      : val
  );
}

export function hashKey(key: CacheKey): string[] {
  return typeof key === 'string'
    ? [key]
    : key.map((k) => {
        return typeof k === 'string' ? k : hash(k);
      });
}

export function getCacheValue(
  keys: string[],
  state: CacheState
): CacheData | undefined {
  let parent: CacheKeys | undefined = state;
  for (const key of keys) {
    parent = parent?.keys?.[key];
    if (!parent) return undefined;
  }
  return parent?.data;
}

export function isCacheValid(cache: CacheData, exp: number) {
  return !cache.invalid && Date.now() <= cache.date + exp;
}
