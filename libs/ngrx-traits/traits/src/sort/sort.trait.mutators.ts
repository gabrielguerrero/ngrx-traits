import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
} from '../load-entities/load-entities.model';
import { EntityAndSortState, Sort, SortMutators } from './sort.model';
import { sortData } from './sort.utils';

export function createSortTraitMutators<Entity>(
  { selectEntitiesList }: LoadEntitiesSelectors<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity>
): SortMutators<Entity> {
  function sortEntities<S extends EntityAndSortState<Entity>>(
    { active, direction }: Sort<Entity>,
    state: S
  ) {
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
