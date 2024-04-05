import { Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  EntityState,
  NamedEntityState,
  setAllEntities,
} from '@ngrx/signals/entities';
import {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import type { StateSignal } from '@ngrx/signals/src/state-signal';

import { getWithEntitiesKeys } from '../util';
import {
  CallStateMethods,
  NamedCallStateMethods,
} from '../with-call-status/with-call-status';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { getWithEntitiesSortKeys } from './with-entities-sort.util';
import { Sort, sortData, SortDirection } from './with-entities-sort.utils';

export type EntitiesSortState<Entity> = {
  entitiesSort: Sort<Entity>;
};
export type NamedEntitiesSortState<Entity, Collection extends string> = {
  [K in Collection as `${K}Sort`]: Sort<Entity>;
};

export { SortDirection };
export type EntitiesSortMethods<Entity> = {
  sortEntities: (options: { sort: Sort<Entity> }) => void;
};
export type NamedEntitiesSortMethods<Entity, Collection extends string> = {
  [K in Collection as `sort${Capitalize<string & K>}Entities`]: (options: {
    sort: Sort<Entity>;
  }) => void;
};

export function withEntitiesLocalSort<
  Entity extends { id: string | number },
>(options: {
  defaultSort: Sort<Entity>;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: {};
  },
  {
    state: EntitiesSortState<Entity>;
    signals: {};
    methods: EntitiesSortMethods<Entity>;
  }
>;
export function withEntitiesLocalSort<
  Entity extends { id: string | number },
  Collection extends string,
>(options: {
  defaultSort: Sort<Entity>;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  // TODO: the problem seems be with the state pro, when set to empty
  //  it works but is it has a namedstate it doesnt
  {
    state: NamedEntityState<Entity, any>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesSortState<Entity, Collection>;
    signals: {};
    methods: NamedEntitiesSortMethods<Collection, Collection>;
  }
>;
export function withEntitiesLocalSort<
  Entity extends { id: string | number },
  Collection extends string,
>({
  defaultSort,
  ...config
}: {
  defaultSort: Sort<Entity>;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<any, any> {
  const { entitiesKey } = getWithEntitiesKeys(config);
  const { sortEntitiesKey, sortKey } = getWithEntitiesSortKeys(config);
  return signalStoreFeature(
    withState({ [sortKey]: defaultSort }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      return {
        [sortEntitiesKey]: ({ sort: newSort }: { sort: Sort<Entity> }) => {
          patchState(
            state as StateSignal<object>,
            {
              [sortKey]: newSort,
            },
            config.collection
              ? setAllEntities(
                  sortData(state[entitiesKey]() as Entity[], newSort),
                  {
                    collection: config.collection,
                  },
                )
              : setAllEntities(
                  sortData(state[entitiesKey]() as Entity[], newSort),
                ),
          );
        },
      };
    }),
  );
}

export function withEntitiesRemoteSort<
  Entity extends { id: string | number },
>(options: {
  defaultSort: Sort<Entity>;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: CallStateMethods;
  },
  {
    state: EntitiesSortState<Entity>;
    signals: {};
    methods: EntitiesSortMethods<Entity>;
  }
>;
export function withEntitiesRemoteSort<
  Entity extends { id: string | number },
  Collection extends string,
>(options: {
  entity?: Entity;
  defaultSort: Sort<Entity>;
  collection?: Collection;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, any>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: NamedCallStateMethods<Collection>;
  },
  {
    state: NamedEntitiesSortState<Entity, Collection>;
    signals: {};
    methods: NamedEntitiesSortMethods<Entity, Collection>;
  }
>;
export function withEntitiesRemoteSort<
  Entity extends { id: string | number },
  Collection extends string,
>({
  defaultSort,
  ...config
}: {
  entity?: Entity;
  collection?: Collection;
  defaultSort: Sort<Entity>;
}): SignalStoreFeature<any, any> {
  const { setLoadingKey } = getWithCallStatusKeys({
    prop: config.collection,
  });
  const { sortKey, sortEntitiesKey } = getWithEntitiesSortKeys(config);
  return signalStoreFeature(
    withState({ [sortKey]: defaultSort }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const setLoading = state[setLoadingKey] as () => void;

      return {
        [sortEntitiesKey]: ({ sort: newSort }: { sort: Sort<Entity> }) => {
          patchState(state as StateSignal<object>, {
            [sortKey]: newSort,
          });
          setLoading();
        },
      };
    }),
  );
}
