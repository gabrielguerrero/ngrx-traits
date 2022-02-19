import {
  ƟLoadEntitiesEntitiesPaginationState,
  EntitiesPaginationMutators,
  EntitiesPaginationSelectors,
} from './entities-pagination.model';
import { LoadEntitiesKeyedConfig } from '../load-entities';

export function createPaginationTraitMutators<Entity>(
  allSelectors: EntitiesPaginationSelectors<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity>
): EntitiesPaginationMutators<Entity> {
  const adapter = allConfigs.loadEntities!.adapter;

  function mergePaginatedEntities<
    S extends ƟLoadEntitiesEntitiesPaginationState<Entity>
  >(entities: Entity[], total = undefined, state: S): S {
    const cacheType = state.pagination.cache.type;

    switch (cacheType) {
      case 'full':
        return adapter.setAll(entities, {
          ...state,
          pagination: {
            ...state.pagination,
            total: entities.length,
            cache: {
              ...state.pagination.cache,
              start: 0,
              end: entities.length,
            },
          },
        });
      case 'partial': {
        const isPreloadNextPages =
          state.pagination.currentPage + 1 === state.pagination.requestPage;

        const start = state.pagination.currentPage * state.pagination.pageSize;
        const newEntities = isPreloadNextPages
          ? [...allSelectors.selectPageEntitiesList(state), ...entities]
          : entities;
        return adapter.setAll(newEntities, {
          ...state,
          pagination: {
            ...state.pagination,
            total,
            cache: {
              ...state.pagination.cache,
              start,
              end: start + entities.length,
            },
          },
        });
      }
      case 'grow':
        return adapter.addMany(entities, {
          ...state,
          pagination: {
            ...state.pagination,
            total,
            cache: {
              ...state.pagination.cache,
              end: state.ids.length + entities.length,
            },
          },
        });
    }

    return state;
  }
  return { mergePaginatedEntities };
}
