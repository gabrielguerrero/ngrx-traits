import { ActionCreatorProps } from '@ngrx/store/src/models';
import {
  camelCaseToSentence,
  capitalize,
  createTraitFactory,
  TraitActionsFactoryConfig,
} from '@ngrx-traits/core';
import { createAction, createReducer, on } from '@ngrx/store';

import { addAsyncActionTrait } from '../async-action/async-action.trait';
import { LoadEntitySelectors, LoadEntityState } from './load-entity.model';
import { TraitInitialStateFactoryConfig } from '@ngrx-traits/core';
import {
  ActionCreatorWithOptionalProps,
  AsyncActionActions,
  AsyncActionSelectors,
  AsyncActionState,
} from '../async-action';

type RecordEntity<T> = T extends Record<string, infer J> ? J : never;

/**
 * Generates ngrx code needed to load and entity and store it in a state. This action can be added
 * more than once as long as the entityName para is different
 * @param entityName - Entity name, should be in camel case
 * @param options.actionProps - Optional param for the main request action,
 * use the props() function for its value, if not present action will have no params,
 * @param options.actionSuccessProps - Optional param for the request success
 * action, use the props() function for its value, if not present action success will have no params
 * @param options.actionFailProps - Optional param for the request fail action,
 * use the props() function for its value, if not present action fail will have no params
 * @returns the trait factory
 *
 * @example
 *
 * export interface TestState
 * extends LoadEntityState<Client,'client'>{}
 *
 * const traits = createEntityFeatureFactory(
 * ...addLoadEntityTrait({
 *        entityName: 'client',
 *        requestProps: props<{ id: string }>(),
 *        responseProps: props<{ client: Client }>(),
 *      }),
 * )({
 *      actionsGroupKey: 'Client',
 *      featureSelector: createFeatureSelector<
 *        LoadEntityState<Client, 'client'>
 *        >('client'),
 *    });
 *
 * //   adds following props to the state:
 * //    loadClientStatus?: 'loading' | 'success' | 'fail';
 * //    client?: Client;
 *
 * // generated actions
 * traits.actions.loadClient({id:123});
 * traits.actions.loadClientSuccess({client: {id: '123', name: 'gabs'}});
 * traits.actions.loadClientFail();
 * // generated selectors
 * traits.selectors.selectClient()
 * traits.selectors.isClientLoading()
 * traits.selectors.isClientSuccess()
 * traits.selectors.isClientFail()
 */
export function addLoadEntityTrait<
  J extends string,
  Request extends object | undefined = undefined,
  Response extends Record<J, any> | undefined = undefined,
  Failure extends object | undefined = undefined,
  Entity = RecordEntity<Response>,
  State = LoadEntityState<Entity, J>
>({
  entityName,
  actionProps,
  actionSuccessProps,
  actionFailProps,
}: {
  entityName: J;
  actionProps?: ActionCreatorProps<Request>;
  actionSuccessProps?: ActionCreatorProps<Response>;
  actionFailProps?: ActionCreatorProps<Failure>;
}) {
  const capitalizedName = capitalize(entityName);

  type K = `load${Capitalize<J & string>}`;
  let internalActions: AsyncActionActions<
    Request,
    Response,
    Failure,
    'request'
  >;
  const name = 'load' + capitalizedName;
  const nameAsSentence = camelCaseToSentence(name);
  return (
    addAsyncActionTrait<K, Request, Response, Failure>({
      name: ('load' + capitalizedName) as K,
      actionProps,
      actionSuccessProps,
      actionFailProps,
    }),
    createTraitFactory({
      key: `load${capitalizedName}`,
      config: { entityName, actionProps, actionSuccessProps, actionFailProps },
      actions: ({
        actionsGroupKey,
      }: TraitActionsFactoryConfig): AsyncActionActions<
        Request,
        Response,
        Failure,
        `load${Capitalize<J & string>}`
      > => {
        internalActions = {
          request: (actionProps
            ? createAction(
                `${actionsGroupKey} ${nameAsSentence}`,
                actionProps as any
              )
            : createAction(
                `${actionsGroupKey} ${nameAsSentence}`
              )) as ActionCreatorWithOptionalProps<Request>,
          requestSuccess: (actionSuccessProps
            ? createAction(
                `${actionsGroupKey} ${nameAsSentence} Success`,
                actionSuccessProps as any
              )
            : createAction(
                `${actionsGroupKey} ${nameAsSentence} Success`
              )) as ActionCreatorWithOptionalProps<Response>,
          requestFail: (actionFailProps
            ? createAction(
                `${actionsGroupKey} ${nameAsSentence} Failure`,
                actionFailProps as any
              )
            : createAction(
                `${actionsGroupKey} ${nameAsSentence} Failure`
              )) as ActionCreatorWithOptionalProps<Failure>,
        };
        if (name) {
          return {
            [`${name}`]: internalActions.request,
            [`${name}Success`]: internalActions.requestSuccess,
            [`${name}Fail`]: internalActions.requestFail,
          } as AsyncActionActions<
            Request,
            Response,
            Failure,
            `load${Capitalize<J & string>}`
          >;
        }
        return internalActions;
      },
      selectors: () => {
        function isLoadingEntity(state: State) {
          return (state as any)[`${entityName}Status`] === 'loading';
        }
        function isSuccessEntity(state: State) {
          return (state as any)[`${entityName}Status`] === 'success';
        }
        function isFailEntity(state: State) {
          return (state as any)[`${entityName}Status`] === 'fail';
        }
        function selectEntity(state: State) {
          return (state as any)[`${entityName}`] as Entity;
        }

        return {
          [`is${capitalizedName}Loading`]: isLoadingEntity,
          [`is${capitalizedName}Success`]: isSuccessEntity,
          [`is${capitalizedName}Fail`]: isFailEntity,
          [`select${capitalizedName}`]: selectEntity,
        } as LoadEntitySelectors<Entity, J> &
          AsyncActionSelectors<J, AsyncActionState<J>>;
      },
      initialState: ({
        previousInitialState,
      }: TraitInitialStateFactoryConfig) => previousInitialState as State,
      reducer: ({ initialState, allActions }) => {
        return createReducer(
          initialState,
          on(internalActions.request, (state: any) => ({
            ...state,
            [`${entityName}Status`]: 'loading',
          })),
          on(internalActions.requestFail, (state: any) => ({
            ...state,
            [`${entityName}Status`]: 'fail',
          })),
          on(internalActions.requestSuccess, (state: any) => ({
            ...state,
            [`${entityName}Status`]: 'success',
          })),
          on(
            (allActions as any)[`load${capitalizedName}Success`],
            (state: any, action: any) => ({
              ...state,
              [entityName]: action[entityName],
            })
          )
        );
      },
    })
  );
}
