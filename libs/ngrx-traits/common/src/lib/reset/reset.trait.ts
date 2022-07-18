import { createTraitFactory, insertIf } from '@ngrx-traits/core';
import { GenericActionCreator } from '../load-entities';
import { TraitActionsFactoryConfig } from '@ngrx-traits/core';
import { createAction, createReducer, on, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { TraitEffect } from '@ngrx-traits/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mapTo } from 'rxjs/operators';
import { ActionCreator, TypedAction } from '@ngrx/store/src/models';

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
  } = {}
) {
  return createTraitFactory({
    key: 'reset',
    config: traitConfig,
    actions: ({
      actionsGroupKey,
      entitiesName,
    }: TraitActionsFactoryConfig) => ({
      resetEntitiesState: createAction(
        `${actionsGroupKey} Reset ${entitiesName} State`
      ),
    }),
    reducer: ({ allActions, initialState }) =>
      createReducer(
        initialState,
        on(allActions.resetEntitiesState, () => initialState),
        ...insertIf<typeof initialState>(traitConfig.resetOn, () =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          on(...traitConfig.resetOn!, () => initialState)
        )
      ),
  });
}
