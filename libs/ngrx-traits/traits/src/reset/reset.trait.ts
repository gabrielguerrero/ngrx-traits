import { createTraitFactory } from 'ngrx-traits';
import { GenericActionCreator } from '../load-entities';
import { TraitActionsFactoryConfig } from 'ngrx-traits';
import { createAction, createReducer, on, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { TraitEffect } from 'ngrx-traits';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mapTo } from 'rxjs/operators';

export function addResetEntitiesState(
  traitConfig: {
    resetOn?: GenericActionCreator[];
  } = {}
) {
  return createTraitFactory({
    key: 'reset',
    config: traitConfig,
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) => ({
      resetEntitiesState: createAction(`${actionsGroupKey} Reset State`),
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
