import { ActionCreatorProps } from '@ngrx/store/src/models';
import { capitalize, createTraitFactory } from '@ngrx-traits/core';
import { createReducer, on } from '@ngrx/store';

import { addAsyncActionTrait } from '../async-action/async-action.trait';
import { LoadEntitySelectors, LoadEntityState } from './load-entity.model';
import { TraitInitialStateFactoryConfig } from '@ngrx-traits/core';

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
 * ...addLoadEntityTraits({
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
 * traits.selectors.isLoadingLoadClient()
 * traits.selectors.isSuccessLoadClient()
 * traits.selectors.isFailLoadClient()
 */
export function addLoadEntityTraits<
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

  return [
    addAsyncActionTrait<K, Request, Response, Failure>({
      name: ('load' + capitalizedName) as K,
      actionProps,
      actionSuccessProps,
      actionFailProps,
    }),
    createTraitFactory({
      key: `load${capitalizedName}`,
      config: { entityName, actionProps, actionSuccessProps, actionFailProps },
      selectors: () => {
        function selectEntity(state: State) {
          return (state as any)[`${entityName}`] as Entity;
        }

        return {
          [`select${capitalizedName}`]: selectEntity,
        } as LoadEntitySelectors<Entity, J>;
      },
      initialState: ({
        previousInitialState,
      }: TraitInitialStateFactoryConfig) => previousInitialState as State,
      reducer: ({ initialState, allActions }) => {
        return createReducer(
          initialState,
          on(
            (allActions as any)[`load${capitalizedName}Success`],
            (state: any, action: any) => ({
              ...state,
              [entityName]: action[entityName],
            })
          )
        );
      },
    }),
  ] as const;
}
