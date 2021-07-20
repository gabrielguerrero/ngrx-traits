import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
} from '../load-entities/load-entities.model';
import { SortMutators } from './sort.model';
export declare function createSortTraitMutators<Entity>(
  { selectAll }: LoadEntitiesSelectors<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity>
): SortMutators<Entity>;
