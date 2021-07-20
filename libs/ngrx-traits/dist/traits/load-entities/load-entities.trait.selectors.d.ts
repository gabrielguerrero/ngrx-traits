import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
} from './load-entities.model';
import { FilterKeyedConfig } from '../filter';
export declare function createLoadEntitiesTraitSelectors<Entity>(
  allConfigs?: LoadEntitiesKeyedConfig<Entity> &
    FilterKeyedConfig<Entity, unknown>
): LoadEntitiesSelectors<Entity>;
