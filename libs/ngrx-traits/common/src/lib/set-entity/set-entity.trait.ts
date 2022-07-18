import {
  capitalize,
  createTraitFactory,
  TraitActionsFactoryConfig,
} from '@ngrx-traits/core';
import { createAction, createReducer, on } from '@ngrx/store';

import {
  SetEntityActions,
  SetEntitySelectors,
  SetEntityState,
} from './set-entity.model';
import { TraitInitialStateFactoryConfig } from '@ngrx-traits/core';
import { ActionCreatorProps } from '@ngrx/store/src/models';

type RecordEntity<T> = T extends Record<string, infer J> ? J : never;

/**
 * Generates ngrx code needed to set and entity in the store state
 * @param entityName - Entity name, should be in camel case
 * @param options.actionProps - param for the main request action,
 * use the props() function for its value
 * @returns the trait factory
 *
 * @example
 *
 * export interface TestState
 * extends SetEntityState<Client,'client'>{}
 *
 * const traits = createEntityFeatureFactory(
 * addSetEntityTraits({
 *        entityName: 'client',
 *        actionProps: props<{ client: Client }
 *      }),
 * )({
 *      actionsGroupKey: 'Client',
 *      featureSelector: createFeatureSelector<
 *        SetEntityState<Client, 'client'>
 *        >('client'),
 *    });
 * //   adds following props to the state:
 * //    client?: Client;
 *
 * // generated actions
 * traits.actions.setClient({client: {id:123, name: 'gabs'}});
 * //generated selectors
 * traits.selectors.selectClient()
 */
export function addSetEntityTrait<
  J extends string,
  Payload extends Record<J, any> | undefined = undefined,
  Entity = RecordEntity<Payload>,
  State = SetEntityState<Entity, J>
>({
  entityName,
  actionProps,
}: {
  entityName: J;
  actionProps?: ActionCreatorProps<Payload>;
}) {
  const capitalizedName = capitalize(entityName);

  return createTraitFactory({
    key: `load${capitalizedName}`,
    config: { entityName, actionProps },
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) => {
      const setEntity = createAction(
        `${actionsGroupKey} Set ${capitalizedName}`,
        actionProps as any
      );

      return {
        [`set${capitalizedName}`]: setEntity,
      } as SetEntityActions<Payload, J>;
    },
    selectors: () => {
      function selectEntity(state: State) {
        return (state as any)[`${entityName}`] as Entity;
      }

      return {
        [`select${capitalizedName}`]: selectEntity,
      } as SetEntitySelectors<Entity, J>;
    },
    initialState: ({ previousInitialState }: TraitInitialStateFactoryConfig) =>
      previousInitialState as State,
    reducer: ({ initialState, allActions }) => {
      return createReducer(
        initialState,
        on(
          (allActions as any)[`set${capitalizedName}`],
          (state: any, action: any) => ({
            ...state,
            [entityName]: action[entityName],
          })
        )
      );
    },
  });
}
