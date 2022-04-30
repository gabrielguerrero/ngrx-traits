import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
  LoadEntitiesState,
} from '../load-entities/load-entities.model';
import {
  Sort,
  SortEntitiesMutators,
  SortEntitiesState,
} from './sort-entities.model';
import { sortData } from './sort-entities.utils';

export function createSortTraitMutators<Entity>(
  { selectEntitiesList }: LoadEntitiesSelectors<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity>
): SortEntitiesMutators<Entity> {
  function sortEntities<
    S extends LoadEntitiesState<Entity> & SortEntitiesState<Entity>
  >({ active, direction }: Sort<Entity>, state: S) {
    const { adapter } = allConfigs.loadEntities!;
    const entities = selectEntitiesList(state);
    const sortedIds = sortData(entities, { active, direction }).map((v) =>
      adapter.selectId(v)
    );
    return {
      ...state,
      ids: sortedIds,
      sort: { ...state.sort, current: { active, direction } },
    };
  }
  return {
    sortEntities,
  };
}
