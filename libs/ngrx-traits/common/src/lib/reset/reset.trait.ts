import {
  createTraitFactory,
  insertIf,
  TraitActionsFactoryConfig,
} from '@ngrx-traits/core';
import { ActionCreator, createAction, createReducer, on } from '@ngrx/store';

/**
 * Generates the ngrx code needed to reset the current state to the initial state.
 * @param traitConfig - Config object fot the trait factory
 * @param traitConfig.resetOn - set an extra action which will also trigger a reset state,
 * useful if you want to create an action that reset several features states
 *
 * @example
 * // The following trait config
 *
 *    const traits = createEntityFeatureFactory(
 *      {entityName: 'Todo'},
 *      addLoadEntitiesTrait<Todo>(),
 *      addResetEntitiesStateTrait()
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 * // generated actions
 * traits.actions.resetTodosState()
 */
export function addResetEntitiesStateTrait(
  traitConfig: {
    resetOn?: readonly ActionCreator[];
  } = {},
) {
  return createTraitFactory({
    key: 'reset',
    config: traitConfig,
    actions: ({
      actionsGroupKey,
      entitiesName,
    }: TraitActionsFactoryConfig) => ({
      resetEntitiesState: createAction(
        `${actionsGroupKey} Reset ${entitiesName} State`,
      ),
    }),
    reducer: ({ allActions, initialState }) =>
      createReducer(
        initialState,
        on(allActions.resetEntitiesState, () => initialState),
        ...insertIf<typeof initialState>(traitConfig.resetOn, () =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          on(...traitConfig.resetOn!, () => initialState),
        ),
      ),
  });
}
