import { createAction, createReducer, on } from '@ngrx/store';
import { ActionCreatorProps } from '@ngrx/store/src/models';
import { camelCaseToSentence, createTraitFactory } from '@ngrx-traits/core';
import {
  ActionCreatorWithOptionalProps,
  AsyncActionActions,
  AsyncActionSelectors,
  AsyncActionState,
} from './async-action.model';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
} from '@ngrx-traits/core';

/**
 * Generates the typical ngrx code need to make a async action with
 * a request, success and failure actions, plus a status property to track its progress
 * and selectors to query the status. This trait can be added more thant once as long
 * as the name prop is different.
 *
 * @param options - Config object for the trait factory
 * @param options.name - Name of the main request action, should be in camel case
 * @param options.actionProps - Optional param for the main request action, use the props()
 * function for its value, if not present action will have no params,
 * @param options.actionSuccessProps - Optional param for the request success action,
 * use the props() function for its value, if not present action success will have no params
 * @param options.actionFailProps - Optional param for the request fail action,
 * use the props() function for its value, if not present action fail will have no params
 * @returns the trait factory
 *
 * @example
 *
 * export interface TestState
 * extends AsyncActionState<'createClient'>{}
 *
 * // The following trait config
 * const traits = createEntityFeatureFactory(
 *      {entityName: 'Todo'},
 *      addAsyncActionTrait({
 *        name: 'createClient',
 *        actionProps: props<{ name: string }>(),
 *        actionSuccessProps: props<{ id: string }>(),
 *      }),
 * )({
 *      actionsGroupKey: 'Client',
 *      featureSelector: createFeatureSelector<AsyncActionState<'createClient'>>(
 *        'client',
 *      ),
 *    });
 * //   adds following props to the state:
 * //    createClientStatus?: 'loading' | 'success' | 'fail';
 *
 * // generated actions
 * traits.actions.createClient({name:'Pedro'})
 * traits.actions.createClientSuccess({id:'123'})
 * traits.actions.createClientFail();
 * //generated selectors
 * traits.selectors.isLoadingCreateClient
 * traits.selectors.isSuccessCreateClient
 * traits.selectors.isFailCreateClient
 */
export function addAsyncActionTrait<
  J extends string,
  Request extends object | undefined = undefined,
  Response extends object | undefined = undefined,
  Failure extends object | undefined = undefined
>({
  name,
  actionProps,
  actionSuccessProps,
  actionFailProps,
}: {
  name: J;
  actionProps?: ActionCreatorProps<Request>;
  actionSuccessProps?: ActionCreatorProps<Response>;
  actionFailProps?: ActionCreatorProps<Failure>;
}) {
  const nameAsSentence = camelCaseToSentence(name);

  let internalActions: AsyncActionActions<
    Request,
    Response,
    Failure,
    'request'
  >;
  return createTraitFactory({
    key: name + '-call',
    config: {
      name,
      actionProps,
      actionSuccessProps,
      actionFailProps,
    },
    actions: ({
      actionsGroupKey,
    }: TraitActionsFactoryConfig): AsyncActionActions<
      Request,
      Response,
      Failure,
      J
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
      return {
        [`${name}`]: internalActions.request,
        [`${name}Success`]: internalActions.requestSuccess,
        [`${name}Fail`]: internalActions.requestFail,
      } as AsyncActionActions<Request, Response, Failure, J>;
    },
    selectors: () => {
      function isLoadingEntity<S extends AsyncActionState<J>>(state: S) {
        return (state as any)[`${name}Status`] === 'loading';
      }
      function isSuccessEntity<S extends AsyncActionState<J>>(state: S) {
        return (state as any)[`${name}Status`] === 'success';
      }
      function isFailEntity<S extends AsyncActionState<J>>(state: S) {
        return (state as any)[`${name}Status`] === 'fail';
      }
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      return {
        [`isLoading${capitalizedName}`]: isLoadingEntity,
        [`isSuccess${capitalizedName}`]: isSuccessEntity,
        [`isFail${capitalizedName}`]: isFailEntity,
      } as AsyncActionSelectors<J, AsyncActionState<J>>;
    },
    initialState: ({ previousInitialState }: TraitInitialStateFactoryConfig) =>
      previousInitialState as AsyncActionState<J>,
    reducer: ({ initialState }) => {
      // TypeScript error after migration to 4.9.5
      // Added 'any' to 'state' and removed 'as AsyncActionState<J>'
      // because OnReducer have a weird type for the state.
      // TODO: Investigate if possible to remove the 'any' type and have better type safety
      // tried remove the any seems to be a problex with ngrx on making the state unknown
      return createReducer(
        initialState,
        on(internalActions.request, (state: any) => ({
          ...state,
          [`${name}Status`]: 'loading',
        })),
        on(internalActions.requestFail, (state: any) => ({
          ...state,
          [`${name}Status`]: 'fail',
        })),
        on(internalActions.requestSuccess, (state: any) => ({
          ...state,
          [`${name}Status`]: 'success',
        }))
      );
    },
  });
}
