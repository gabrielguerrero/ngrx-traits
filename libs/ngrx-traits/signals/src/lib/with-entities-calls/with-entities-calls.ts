import {
  computed,
  EnvironmentInjector,
  inject,
  isDevMode,
  isSignal,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  EntityProps,
  EntityState,
  NamedEntityProps,
  NamedEntityState,
  removeEntity,
  SelectEntityId,
  updateEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  concatMap,
  finalize,
  first,
  from,
  isObservable,
  map,
  mergeMap,
  Observable,
  of,
  pipe,
  tap,
} from 'rxjs';
import { filter } from 'rxjs/operators';

import { getWithEntitiesKeys, insertIf } from '../util';
import { registerCallState } from '../with-all-call-status/with-all-call-status.util';
import { NamedCallStatusMapState } from '../with-call-status-map/with-call-status-map.model';
import {
  CallStatus,
  NamedCallStatusState,
} from '../with-call-status/with-call-status.model';
import { ObservableCall } from '../with-calls/with-calls.model';
import { withFeatureFactory } from '../with-feature-factory/with-feature-factory';
import { StoreSource } from '../with-feature-factory/with-feature-factory.model';
import {
  EntityCall,
  EntityCallConfig,
  NamedEntitiesCallsStatusComputed,
  NamedEntitiesCallsStatusMethods,
} from './with-entities-calls.model';
import { getWithEntitiesCallKeys } from './with-entities-calls.util';

/**
 * Generates necessary state, computed and methods to track the progress of
 * calls related to an entity and merges the result back to entities list. The generated methods are rxMethods with
 * the same name as the original call, which accepts either the original parameters
 * or a Signal or Observable of the same type as the original parameters.
 * The original call can only have zero or one parameter, use an object with multiple
 * props as first param if you need more.
 * *Important* The calls must have a parameter of type Entity  {entity: Entity, ...extra params} or use entityCallConfig
 * and the paramsSelectId to return with param prop represents the entityId .
 * The call can be skipped based on the result of the previous call, to skip a call return undefined or false.
 * @param config.entity - The entity type to be used
 * @param config.collection - The optional collection name to be used
 * @param config.selectId - The function to use to select the id of the entity
 * @param config.callsFactory - a factory function that receives the store and returns an object of type {Record<string,  EntitiesCallConfig>} with the calls to be made
 *
 * @example
 * const orderEntity = entityConfig({
 *   entity: type<OrderSummary & { items?: OrderDetail['items'] }>(),
 *   collection: 'order',
 * });
 * export const OrderStore = signalStore(
 *   withEntities(orderEntity),
 *   withEntitiesCalls({
 *     ...orderEntity,
 *     calls: (store, orderService = inject(OrderService)) => ({
 *       loadOrderDetail: (entity) => orderService.getOrderDetail(entity.id),
 *       // alternative way to define the call
 *       // loadOrderDetail: entityCallConfig({
 *       //   call: (entity: OrderSummary) => orderService.getOrderDetail(entity.id),
 *       //   // skip the call if result is already loaded
 *       //   skipWhen: (param, previousResult) => !!previousResult?.items,
 *       // }),
 *       changeOrderStatus: (option: {
 *         entity: OrderSummary;
 *         status: OrderSummary['status'];
 *       }) => orderService.changeStatus(option.entity.id, option.status),
 *       deleteOrder: (entity: OrderSummary) => {
 *         return orderService.delete(entity.id).pipe(
 *           map((deleted) => {
 *             deleted ? undefined : entity; // returning undefined will remove the entity from the store
 *           }),
 *         );
 *       },
 *     }),
 *   }),
 * );
 *
 *   // generates the following signals
 *   store.loadOrderDetailCallStatus // a map { [id: string]:'init' | 'loading' | 'loaded' | { error: unknown }}
 *   // similar for changeOrderStatus and deleteOrder *
 *   // the calls updates the entities so results, which can be accessed with the usual entities list computed signals
 *   // generates the following computed signals
 *   store.isAnyLoadOrderDetailLoading: Signal<boolean>
 *   store.isAnyLoadOrderDetailLoaded: Signal<boolean>
 *   store.loadOrderDetailErrors: Signal<unknown[]>
 *   // same for changeOrderStatus and deleteOrder
 *   // generates the following methods
 *   store.isLoadOrderDetailLoading(id: string) => boolean
 *   store.isLoadOrderDetailLoaded(id: string) => boolean
 *   store.loadOrderDetailError(id: string) => string | null
 *   store.loadOrderDetail ({id: string} | Signal<{id: string}> | Observable<{id: string}>) => void
 *   // same for changeOrderStatus and deleteOrder
 *
 */
export function withEntitiesCalls<
  Input extends SignalStoreFeatureResult,
  Entity,
  const Calls extends Record<
    string,
    EntityCall<NoInfer<Entity>> | EntityCallConfig<NoInfer<Entity>>
  >,
  Collection extends string = '',
>(config: {
  entity: Entity;
  collection?: Collection;
  selectId?: SelectEntityId<NoInfer<Entity>>;
  calls: (store: StoreSource<Input>) => Calls;
}): SignalStoreFeature<
  Input &
    (Collection extends ''
      ? {
          state: EntityState<NoInfer<Entity>>;
          props: EntityProps<NoInfer<Entity>>;
          methods: {};
        }
      : {
          state: NamedEntityState<NoInfer<Entity>, Collection>;
          props: NamedEntityProps<NoInfer<Entity>, Collection>;
          methods: {};
        }),
  {
    state: NamedCallStatusMapState<keyof Calls & string>;
    props: NamedEntitiesCallsStatusComputed<Calls>;
    methods: NamedEntitiesCallsStatusMethods<Entity, Calls> & {
      [K in keyof Calls]: Calls[K] extends (...args: infer P) => any
        ? {
            (param: P[0]): void;
            (param: Observable<P[0]> | Signal<P[0]>): void;
          }
        : Calls[K] extends EntityCallConfig
          ? Parameters<Calls[K]['call']> extends undefined[]
            ? () => void
            : {
                (...param: Parameters<Calls[K]['call']>): void;
                (
                  param:
                    | Observable<Parameters<Calls[K]['call']>[0]>
                    | Signal<Parameters<Calls[K]['call']>[0]>,
                ): void;
              }
          : never;
    };
  }
> {
  return withFeatureFactory((store) => {
    const calls = config.calls(store as StoreSource<Input>);
    const callsState = Object.entries(calls).reduce(
      (acc, [callName]) => {
        const { callStatusKey } = getWithEntitiesCallKeys({
          callName,
        });
        acc[callStatusKey] = {};
        return acc;
      },
      {} as Record<string, any>,
    );

    const hasCallWith = Object.entries(calls).some(
      ([, call]) => 'callWith' in call,
    );
    return signalStoreFeature(
      withState(callsState),
      withComputed((state: Record<string, Signal<unknown>>) => {
        const callsComputed = Object.keys(calls).reduce(
          (acc, callName) => {
            const {
              isAnyLoadingKey,
              areAllLoadedKey,
              errorsKey,
              callStatusKey,
            } = getWithEntitiesCallKeys({ callName });
            const callState = state[callStatusKey] as Signal<
              Record<string, CallStatus>
            >;
            const isAnyLoading = computed(() =>
              Object.values(callState()).some((status) => status === 'loading'),
            );
            const areAllLoaded = computed(() => {
              const values = Object.values(callState());
              return values?.length
                ? values.every((status) => status === 'loaded')
                : false;
            });

            const errors = computed(() => {
              const v = callState();
              const errorsArray = Object.values(v)
                .map((v) => (typeof v === 'object' ? v.error : undefined))
                .filter(Boolean);
              return errorsArray?.length ? errorsArray : undefined;
            });

            registerCallState(store, { loading: isAnyLoading, error: errors });
            acc[isAnyLoadingKey] = isAnyLoading;
            acc[errorsKey] = errors;
            acc[areAllLoadedKey] = areAllLoaded;

            return acc;
          },
          {} as Record<string, any>,
        );
        return callsComputed;
      }),
      withMethods(
        (state, environmentInjector = inject(EnvironmentInjector)) => {
          const methods = Object.entries(calls).reduce(
            (acc, [callName, call]) => {
              const {
                callStatusKey,
                callNameKey,
                isLoadingKey,
                isLoadedKey,
                errorKey,
              } = getWithEntitiesCallKeys({
                callName,
              });
              const { entityMapKey } = getWithEntitiesKeys({
                collection: config.collection,
              });
              const entityMap = state[entityMapKey] as Signal<
                Record<string, NoInfer<Entity>>
              >;
              const callState = state[callStatusKey] as Signal<
                Record<string, CallStatus>
              >;

              function selectId(entityOrId: Entity | string | number) {
                return typeof entityOrId === 'string' ||
                  typeof entityOrId === 'number'
                  ? entityOrId
                  : config.selectId
                    ? config.selectId(entityOrId)
                    : ((entityOrId as any).id as string);
              }
              const isLoading = (entityOrId: Entity | string | number) =>
                callState()[selectId(entityOrId)] === 'loading';
              const isLoaded = (entityOrId: Entity | string | number) =>
                callState()[selectId(entityOrId)] === 'loaded';
              const error = (entityOrId: Entity | string | number) => {
                const v = callState()[selectId(entityOrId)];
                return typeof v === 'object' ? v.error : undefined;
              };
              acc[isLoadingKey] = isLoading;
              acc[isLoadedKey] = isLoaded;
              acc[errorKey] = error;

              const setLoading = (id: string | number) => {
                patchState(store, {
                  [callStatusKey]: { ...callState(), [id]: 'loading' },
                } as any);
              };
              const setLoaded = (id: string | number) => {
                patchState(store, {
                  [callStatusKey]: { ...callState(), [id]: 'loaded' },
                } as any);
              };
              const setError = (id: string | number, error: unknown) => {
                patchState(store, {
                  [callStatusKey]: { ...callState(), [id]: { error } },
                } as any);
              };

              const callFn = getCallFn(call);
              const skipWhenFn = isCallConfig(call)
                ? call.skipWhen ??
                  (call.callWith
                    ? (param: unknown) => param === undefined || param === false
                    : undefined)
                : undefined;
              const inFlight = new Set<number | string>();
              acc[callNameKey] = rxMethod<unknown[]>(
                pipe(
                  mergeMap((params: any) => {
                    const id =
                      isCallConfig(call) && call.paramsSelectId
                        ? call.paramsSelectId(params)
                        : typeof params === 'object' && 'entity' in params
                          ? selectId(params.entity)
                          : selectId(params);
                    const previousResult = isCallConfig(call)
                      ? call.storeResult != false
                        ? entityMap()[id]
                        : undefined
                      : entityMap()[id];
                    const skip = skipWhenFn?.(params, previousResult) ?? false;

                    const filterDuplicateIds = filter((value) => {
                      if (inFlight.has(id)) {
                        // Skip this value because it's already being processed.
                        return false;
                      } else {
                        // Mark the value as in-flight and allow it to continue.
                        inFlight.add(id);
                        return true;
                      }
                    });
                    const process$ = pipe(
                      filterDuplicateIds,
                      concatMap((params: any) => {
                        if (!id) {
                          const error = new Error(
                            `The id could not be found in ${callName} params. Make sure the params of the call is of type  Entity | {entity: Entity} or provide a paramsSelectId function in the call config`,
                          );
                          console.error(error);
                          throw error;
                        }
                        setLoading(id);
                        // Set to track which values are currently being processed

                        return runInInjectionContext(
                          environmentInjector,
                          () => {
                            return callFn(params).pipe(
                              map((result) => {
                                patchState(
                                  state,
                                  !!result // if result do an update
                                    ? config.collection
                                      ? updateEntity(
                                          {
                                            id,
                                            changes: result,
                                          },
                                          {
                                            collection: config.collection,
                                            selectId:
                                              config.selectId ??
                                              ((entity: Entity) =>
                                                (entity as any).id),
                                          } as any,
                                        )
                                      : updateEntity({
                                          id,
                                          changes: result,
                                        })
                                    : config.collection // if no result do a remove
                                      ? removeEntity(id, {
                                          collection: config.collection,
                                          selectId:
                                            config.selectId ??
                                            ((entity: Entity) =>
                                              (entity as any).id),
                                        } as any)
                                      : removeEntity(id),
                                );
                                setLoaded(id);
                                isCallConfig(call) &&
                                  call.onSuccess &&
                                  call.onSuccess(
                                    result,
                                    params,
                                    previousResult,
                                  );
                              }),
                              takeUntilDestroyed(),
                              catchError((error: unknown) => {
                                const e =
                                  (isCallConfig(call) &&
                                    call.mapError?.(error, params)) ||
                                  error;
                                setError(id, e);
                                console.error(
                                  `Call ${callName} fail `,
                                  { params },
                                  e,
                                );
                                isCallConfig(call) &&
                                  call.onError &&
                                  call.onError(e, params);
                                return of();
                              }),
                              finalize(() => {
                                inFlight.delete(id);
                              }),
                            );
                          },
                        );
                      }),
                    );

                    if (typeof skip === 'boolean') {
                      if (isDevMode() && skip)
                        console.warn(`EntityCall ${callName} is skip`);
                      return skip ? of() : of(params).pipe(process$);
                    }
                    // skip is a promise or observable

                    return from(skip).pipe(
                      tap((value) => {
                        if (isDevMode() && value)
                          console.warn(`EntityCall ${callName} is skip`);
                      }),
                      first((v) => !v),
                      map(() => params),
                      process$,
                    );
                  }),
                ),
              );
              return acc;
            },
            {} as Record<string, any>,
          );
          return methods;
        },
      ),
      ...insertIf(hasCallWith, () =>
        withHooks((store: Record<string, Function>) => ({
          onInit: () => {
            for (const [callName, call] of Object.entries(calls)) {
              if ('callWith' in call) {
                if (
                  typeof call.callWith === 'function' &&
                  !isObservable(call.callWith) &&
                  !isSignal(call.callWith)
                ) {
                  store[callName](computed(call.callWith));
                } else if (
                  isObservable(call.callWith) ||
                  isSignal(call.callWith)
                ) {
                  store[callName](call.callWith);
                } else {
                  const value = call.callWith;
                  if (value !== undefined && value !== false) {
                    store[callName](value);
                  }
                }
              }
            }
          },
        })),
      ),
    );
  }) as any;
}
function isCallConfig(
  call: EntityCall<any> | EntityCallConfig,
): call is EntityCallConfig {
  return typeof call === 'object';
}

function getCallFn(
  call: EntityCall<any> | EntityCallConfig,
): ObservableCall<any, any> {
  if (isCallConfig(call)) {
    return (params) => from(call.call(params));
  } else {
    return (params) => from(call(params));
  }
}
