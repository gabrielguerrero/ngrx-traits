import { createTraitFactory } from 'ngrx-traits';
import { GenericActionCreator } from '../load-entities';
import { TraitActionsFactoryConfig } from 'ngrx-traits';
import { createAction, createReducer, on, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { TraitEffect } from 'ngrx-traits';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mapTo } from 'rxjs/operators';

/**
 * Generates the ngrx code needed to reset the current state to the initial state.
 * @param traitConfig - Config object fot the trait factory
 * @param traitConfig.resetOn - set an extra action which will also trigger a reset state,
 * useful if you want to create an action that reset several features states
 *
 * @example
 * // The following trait config
 *
 * export interface TestState
 * extends EntityAndStatusState<Todo>,FilterState<TodoFilter>{}
 *
 *    const traits = createEntityFeatureFactory(
 *      addLoadEntitiesTrait<Todo>(),
 *      addResetEntitiesStateTrait()
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 * // will generate  the following actions, plus the ones generated by other traits
 * traits.actions.resetTodosState()
 */
export function addResetEntitiesStateTrait(
  traitConfig: {
    resetOn?: GenericActionCreator[];
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
        on(allActions.resetEntitiesState, () => initialState)
      ),
    effects: ({ allActions }) => {
      @Injectable()
      class ResetEffect extends TraitEffect {
        externalReset$ =
          traitConfig?.resetOn?.length &&
          createEffect(() => {
            return this.actions$.pipe(
              ofType(...traitConfig?.resetOn),
              mapTo(allActions.resetEntitiesState())
            );
          });

        //TODO: not sure why Im forced to override this constructor
        // or test wont pass, strangely doesnt happen in other files
        // with similar case like pagination.effects.ts
        constructor(actions$: Actions, store: Store<any>) {
          super(actions$, store);
        }
      }
      return traitConfig?.resetOn?.length ? [ResetEffect] : [];
    },
  });
}
