/**
 * Type definitions for targeted migration
 */

export interface StoreInfo {
  filePath: string;
  storeName: string;
  collections: string[];
}

export interface ConsumerInfo {
  filePath: string;
  templatePath?: string;
}

export interface MigrationScope {
  stores: StoreInfo[];
  consumers: Map<string, ConsumerInfo[]>;
  collections: Set<string>;
  allFiles: Set<string>;
}

export interface TransformResult {
  modified: boolean;
  content: string;
  changes: RenameChange[];
}

export interface RenameChange {
  oldName: string;
  newName: string;
  line: number;
}

export const BREAKING_FEATURES = [
  'withCallStatus',
  'withEntitiesLocalFilter',
  'withEntitiesRemoteFilter',
  'withEntitiesLocalSort',
  'withEntitiesRemoteSort',
  'withEntitiesLocalPagination',
  'withEntitiesRemotePagination',
  'withEntitiesRemoteScrollPagination',
] as const;

export type BreakingFeature = (typeof BREAKING_FEATURES)[number];
