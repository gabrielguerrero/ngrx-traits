import {
  effect,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withHooks,
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
import {
  EmptyFeatureResult,
  SignalStoreFeatureResult,
  SignalStoreSlices,
} from '@ngrx/signals/src/signal-store-models';
import { catchError, first, from, map, Observable, of } from 'rxjs';

import {
  CallState,
  CallStateComputed,
  CallStateMethods,
  NamedCallState,
  NamedCallStateComputed,
  NamedCallStateMethods,
} from '../with-call-status/with-call-status';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  EntitiesPaginationRemoteMethods,
  NamedEntitiesPaginationRemoteMethods,
  NamedEntitiesPaginationSetResultMethods,
} from '../with-entities-remote-pagination/with-entities-remote-pagination';
import { getWithEntitiesRemotePaginationKeys } from '../with-entities-remote-pagination/with-entities-remote-pagination.util';

export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number },
>({
  fetchEntities,
}: {
  fetchEntities: (
    store: SignalStoreSlices<Input['state']> &
      Input['signals'] &
      Input['methods'],
  ) =>
    | Observable<
        Input['methods'] extends EntitiesPaginationRemoteMethods<Entity>
          ? { entities: Entity[]; total: number }
          : Entity[] | { entities: Entity[] } // should this be { entities: Entity[];} for consistency?
      >
    | Promise<
        Input['methods'] extends EntitiesPaginationRemoteMethods<Entity>
          ? { entities: Entity[]; total: number }
          : Entity[] | { entities: Entity[] }
      >;
}): SignalStoreFeature<
  Input & {
    state: EntityState<Entity> & CallState;
    signals: EntitySignals<Entity> & CallStateComputed;
    methods: CallStateMethods;
  },
  EmptyFeatureResult
>;

export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number },
  Collection extends string,
>({
  fetchEntities,
}: {
  // entity?: Entity; // is this needed? entity can come from the method fetchEntities return type
  collection: Collection;
  fetchEntities: (
    store: SignalStoreSlices<Input['state']> &
      Input['signals'] &
      Input['methods'],
  ) =>
    | Observable<
        Entity[] | { entities: Entity[]; total?: number }
        // // TODO bellow is not working as expected
        // Input['methods'] extends NamedEntitiesPaginationSetResultMethods<
        //   Entity,
        //   Collection
        // >
        //   ? { entities: Entity[]; total: number } & Prettify<
        //       NamedEntitiesPaginationSetResultMethods<Entity, Collection>
        //     >
        //   : Entity[] | { entities: Entity[] }
      >
    | Promise<
        Entity[] | { entities: Entity[]; total?: number }
        // TODO bellow is not working as expected
        // Input['methods'] extends NamedEntitiesPaginationRemoteSetResult<
        //   Entity,
        //   Collection
        // >
        //   ? { entities: Entity[]; total: number }
        //   : Entity[] | { entities: Entity[] }
      >;
}): SignalStoreFeature<
  Input & {
    state: NamedEntityState<Entity, Collection> & NamedCallState<Collection>;
    signals: NamedEntitySignals<Entity, Collection> &
      NamedCallStateComputed<Collection>;
    methods: NamedCallStateMethods<Collection>;
  },
  EmptyFeatureResult
>;

export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number },
  Collection extends string,
>({
  collection,
  fetchEntities,
}: {
  entity?: Entity; // is this needed? entity can come from the method fetchEntities return type
  collection?: Collection;
  fetchEntities: (
    store: SignalStoreSlices<Input['state']> &
      Input['signals'] &
      Input['methods'],
  ) => Observable<any> | Promise<any>;
}): SignalStoreFeature<Input, EmptyFeatureResult> {
  const { loadingKey, setErrorKey, setLoadedKey } = getWithCallStatusKeys({
    prop: collection,
  });
  const { setEntitiesLoadResultKey } = getWithEntitiesRemotePaginationKeys({
    collection,
  });
  return (store) => {
    const loading = store.signals[loadingKey] as Signal<boolean>;
    const setLoaded = store.methods[setLoadedKey] as () => void;
    const setError = store.methods[setErrorKey] as (error: unknown) => void;
    const setEntitiesLoadResult = store.methods[setEntitiesLoadResultKey] as (
      entities: Entity[],
      total: number,
    ) => void;

    return signalStoreFeature(
      withHooks({
        onInit: (input, environmentInjector = inject(EnvironmentInjector)) => {
          effect(() => {
            if (loading()) {
              runInInjectionContext(environmentInjector, () => {
                from(
                  fetchEntities({
                    ...store.slices,
                    ...store.signals,
                    ...store.methods,
                  } as SignalStoreSlices<Input['state']> &
                    Input['signals'] &
                    Input['methods']),
                )
                  .pipe(
                    map((result) => {
                      if (Array.isArray(result)) {
                        patchState(
                          input,
                          collection
                            ? setAllEntities(result as Entity[], {
                                collection,
                              })
                            : setAllEntities(result),
                        );
                      } else {
                        const { entities, total } = result;
                        if (setEntitiesLoadResult)
                          setEntitiesLoadResult(entities, total);
                        else
                          patchState(
                            input,
                            collection
                              ? setAllEntities(entities as Entity[], {
                                  collection,
                                })
                              : setAllEntities(entities),
                          );
                      }
                      setLoaded();
                    }),
                    catchError((error: unknown) => {
                      setError(error);
                      setLoaded();
                      return of();
                    }),
                    first(),
                  )
                  .subscribe();
              });
            }
          });
        },
      }),
    )(store); // we execute the factory so we can pass the input
  };
}
