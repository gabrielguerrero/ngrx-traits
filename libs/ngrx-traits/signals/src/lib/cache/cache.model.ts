export type CacheKey = string | (string | object)[];

export interface CacheData {
  value: any;
  date: number;
  expires?: number;
  invalid: boolean;
  hitCount: number;
}
export interface CacheKeys {
  keys?: Map<string, CacheKeys>;
  data?: CacheData;
}
export type CacheState = CacheKeys;

export type CacheValue =
  | string
  | number
  | boolean
  | bigint
  | object
  | null
  | undefined;
