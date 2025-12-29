/**
 * Type definitions for targeted migration
 */

export interface StoreInfo {
  filePath: string;
  storeName: string;
  collections: string[];
}

export interface CustomFeatureInfo {
  filePath: string;
  functionName: string;
  collections: string[];
}

export interface ConsumerInfo {
  filePath: string;
  templatePath?: string;
}

export interface MigrationScope {
  stores: StoreInfo[];
  customFeatures: CustomFeatureInfo[];
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
  'withEntitiesHybridFilter',
  'withEntitiesLocalSort',
  'withEntitiesRemoteSort',
  'withEntitiesLocalPagination',
  'withEntitiesRemotePagination',
  'withEntitiesRemoteScrollPagination',
  'withEntitiesLoadingCall',
  'withEntitiesCalls',
  'withEntitiesSingleSelection',
  'withEntitiesMultiSelection',
] as const;

export type BreakingFeature = (typeof BREAKING_FEATURES)[number];
