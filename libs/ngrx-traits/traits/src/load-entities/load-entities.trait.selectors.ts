import { Dictionary } from '@ngrx/entity';
import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
} from './load-entities.model';
import { FilterKeyedConfig } from '../filter';
import { isFail, isLoading, isSuccess } from './load-entities.utils';
import { createSelector } from '@ngrx/store';
import { selectFilter } from '../filter/filter.trait.selectors';

export function createLoadEntitiesTraitSelectors<Entity>(
  allConfigs?: LoadEntitiesKeyedConfig<Entity> &
    FilterKeyedConfig<Entity, unknown>
) {
  const adapter = allConfigs?.loadEntities?.adapter;
  const entitySelectors = adapter?.getSelectors();

  const filterFunction = allConfigs?.filter?.filterFn;
  let selectors = entitySelectors;
  if (filterFunction && entitySelectors) {
    const selectAll = createSelector(
      entitySelectors.selectAll,
      selectFilter,
      (entities, filters) =>
        filters ? entities.filter((e) => filterFunction(filters, e)) : entities
    );

    selectors = {
      selectAll,
      selectEntities: createSelector(
        entitySelectors.selectEntities,
        selectFilter,
        (entities, filters) => {
          const result: Dictionary<Entity> = {};
          for (const id in entities) {
            const e = entities[id];
            if (filterFunction(filters, e!)) {
              result[id] = e;
            }
          }
          return result;
        }
      ),
      selectTotal: createSelector(selectAll, (entities) => entities.length),
      selectIds: createSelector(
        selectAll,
        (entities) =>
          entities.map((e) => adapter?.selectId(e)) as string[] | number[]
      ),
    };
  }
  return {
    ...selectors,
    isFail,
    isLoading,
    isSuccess,
  } as LoadEntitiesSelectors<Entity>;
}
