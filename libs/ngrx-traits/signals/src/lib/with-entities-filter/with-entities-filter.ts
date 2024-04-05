import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';
import { EntityState, NamedEntityState } from '@ngrx/signals/entities';
import {
  EntityMap,
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { StateSignal } from '@ngrx/signals/src/state-signal';
import {
  concatMap,
  debounce,
  distinctUntilChanged,
  EMPTY,
  of,
  pipe,
  tap,
  timer,
} from 'rxjs';

import { getWithEntitiesKeys } from '../util';
import {
  CallStateMethods,
  NamedCallStateMethods,
} from '../with-call-status/with-call-status';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { getWithEntitiesFilterKeys } from './with-entities-filter.util';

export type EntitiesFilterState<Filter> = { entitiesFilter: Filter };
export type NamedEntitiesFilterState<Collection extends string, Filter> = {
  [K in Collection as `${K}Filter`]: Filter;
};

export type EntitiesFilterMethods<Filter> = {
  filterEntities: (options: {
    filter: Filter;
    debounce?: number;
    patch?: boolean;
    forceLoad?: boolean;
  }) => void;
};
export type NamedEntitiesFilterMethods<Collection extends string, Filter> = {
  [K in Collection as `filter${Capitalize<string & K>}Entities`]: (options: {
    filter: Filter;
    debounce?: number;
    patch?: boolean;
    forceLoad?: boolean;
  }) => void;
};

export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Filter extends Record<string, unknown>,
>(options: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: {};
  },
  {
    state: EntitiesFilterState<Filter>;
    signals: {};
    methods: EntitiesFilterMethods<Filter>;
  }
>;
export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>(options: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  // TODO: the problem seems be with the state pro, when set to any
  //  it works but is it has a namedstate it doesnt
  {
    state: NamedEntityState<Entity, any>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesFilterState<Collection, Filter>;
    signals: {};
    methods: NamedEntitiesFilterMethods<Collection, Filter>;
  }
>;
export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>({
  filterFn,
  defaultFilter,
  ...config
}: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<any, any> {
  const { entityMapKey, idsKey } = getWithEntitiesKeys(config);
  const { filterEntitiesKey, filterKey } = getWithEntitiesFilterKeys(config);
  return signalStoreFeature(
    withState({ [filterKey]: defaultFilter }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const filter = state[filterKey] as Signal<Filter>;
      const entitiesMap = state[entityMapKey] as Signal<EntityMap<Entity>>;
      // we create a computed entities that relies on the entitiesMap instead of
      // using the computed state.entities from the withEntities , because this local filter is going to replace
      // the ids array of the state with the filtered ids array, and the state.entities depends on it,
      // so hour filter function needs the full list of entities always which will be always so we get them from entityMap
      const entities = computed(() => Object.values(entitiesMap()));
      return {
        [filterEntitiesKey]: rxMethod<{
          filter: Filter;
          debounce?: number;
          patch?: boolean;
          forceLoad?: boolean;
        }>(
          pipe(
            debounceFilterPipe(filter),
            tap((value) => {
              const newEntities = entities().filter((entity) => {
                return filterFn(entity, value.filter);
              });
              patchState(
                state as StateSignal<EntitiesFilterState<Filter>>,
                {
                  [filterKey]: value.filter,
                },
                {
                  [idsKey]: newEntities.map((entity) => entity.id),
                },
              );
            }),
          ),
        ),
      };
    }),
  );
}

export function withEntitiesRemoteFilter<
  Entity extends { id: string | number },
  Filter extends Record<string, unknown>,
>(options: {
  defaultFilter: Filter;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: CallStateMethods;
  },
  {
    state: EntitiesFilterState<Filter>;
    signals: {};
    methods: EntitiesFilterMethods<Filter>;
  }
>;
export function withEntitiesRemoteFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>(options: {
  defaultFilter: Filter;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, any>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: NamedCallStateMethods<Collection>;
  },
  {
    state: NamedEntitiesFilterState<Collection, Filter>;
    signals: {};
    methods: NamedEntitiesFilterMethods<Collection, Filter>;
  }
>;
export function withEntitiesRemoteFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>({
  defaultFilter,
  ...config
}: {
  entity?: Entity;
  collection?: Collection;
  defaultFilter: Filter;
}): SignalStoreFeature<any, any> {
  const { setLoadingKey } = getWithCallStatusKeys({ prop: config.collection });
  const { filterKey, filterEntitiesKey } = getWithEntitiesFilterKeys(config);
  return signalStoreFeature(
    withState({ [filterKey]: defaultFilter }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const setLoading = state[setLoadingKey] as () => void;
      const filter = state[filterKey] as Signal<Filter>;

      return {
        [filterEntitiesKey]: rxMethod<{
          filter: Filter;
          debounce?: number;
          patch?: boolean;
          forceLoad?: boolean;
        }>(
          pipe(
            debounceFilterPipe(filter),
            tap((value) => {
              setLoading();
              patchState(state as StateSignal<EntitiesFilterState<Filter>>, {
                [filterKey]: value.filter,
              });
            }),
          ),
        ),
      };
    }),
  );
}

function debounceFilterPipe<Filter, Entity>(filter: Signal<Filter>) {
  return pipe(
    debounce(
      (value: {
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }) => (value?.forceLoad ? EMPTY : timer(value.debounce || 300)),
    ),
    concatMap((payload) =>
      payload.patch
        ? of({
            ...payload,
            filter: { ...filter?.(), ...payload?.filter },
          })
        : of(payload),
    ),
    distinctUntilChanged(
      (previous, current) =>
        !current?.forceLoad &&
        JSON.stringify(previous?.filter) === JSON.stringify(current?.filter),
    ),
  );
}
