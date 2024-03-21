import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { EntityState, NamedEntityState } from '@ngrx/signals/entities';
import type {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { StateSignal } from '@ngrx/signals/src/state-signal';
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
import { NamedCallStateMethods } from '../with-call-status/with-call-status';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { getWithEntitiesFilterKeys } from './with-entities-filter.util';

export type EntitiesFilterState<Filter> = { filter: Filter };
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
export type NamedEntitiesFilterMethods2<
  Collection extends string,
  Filter,
> = ReplaceProps<EntitiesFilterMethods<Filter>, 'Entities', Collection>;
// type t = NamedEntitiesFilterMethods2< 'users',{foo: string}>
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
}): any {
  // TODO throw error if pagination trait is present before this one or find a way to make it not matter
  const { entitiesKey } = getWithEntitiesKeys(config);
  const { filterEntitiesKey, filterKey } = getWithEntitiesFilterKeys(config);
  return signalStoreFeature(
    withState({ [filterKey]: defaultFilter }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entities = state[entitiesKey] as Signal<Entity[]>;
      const filter = state[filterKey] as Signal<Filter>;
      return {
        [entitiesKey]: computed(() => {
          return entities().filter((entity) => {
            return filterFn(entity, filter());
          });
        }),
      };
    }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const filter = state[filterKey] as Signal<Filter>;
      return {
        [filterEntitiesKey]: rxMethod<{
          filter: Filter;
          debounce?: number;
          patch?: boolean;
          forceLoad?: boolean;
        }>(
          debounceFilterPipe(
            filter,
            filterKey,
            state as StateSignal<EntitiesFilterState<Filter>>,
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
    methods: {
      setLoading: () => void;
    };
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
}): any {
  // TODO fix the any type here
  const { setLoadingKey } = getWithCallStatusKeys({ prop: config.collection });
  const { filterKey, filterEntitiesKey } = getWithEntitiesFilterKeys(config);
  return signalStoreFeature(
    // type<ReturnType<typeof withEntities1>>(),
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
            debounceFilterPipe(
              filter,
              filterKey,
              state as StateSignal<EntitiesFilterState<Filter>>,
            ),
            tap(() => setLoading()),
          ),
        ),
      };
    }),
  );
}

function debounceFilterPipe<Filter>(
  filter: Signal<Filter>,
  filterKey: string,
  store: StateSignal<EntitiesFilterState<Filter>>,
) {
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
            filter: { ...filter?.() },
          })
        : of(payload),
    ),
    distinctUntilChanged(
      (previous, current) =>
        !current?.forceLoad &&
        JSON.stringify(previous?.filter) === JSON.stringify(current?.filter),
    ),
    tap((value) => {
      patchState(store, { [filterKey]: value.filter });
    }),
  );
}

export type Replace<
  Target extends string,
  FindKey extends string,
  ReplaceKey extends string,
> = Target extends `${infer Prefix}${FindKey}${infer Postfix}`
  ? `${Prefix}${Capitalize<ReplaceKey>}${Postfix}`
  : Target;
export type ReplaceProps<
  Target,
  FindKey extends string,
  ReplaceKey extends string,
> = {
  [Prop in keyof Target as Replace<
    string & Prop,
    FindKey,
    ReplaceKey
  >]: Target[Prop];
};
