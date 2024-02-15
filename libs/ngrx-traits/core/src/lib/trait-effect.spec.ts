import { Injectable } from '@angular/core';
import { TraitEffect } from '@ngrx-traits/core';
import { createAction } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { first, map } from 'rxjs/operators';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { from } from 'rxjs';


describe('TraitEffect', () => {
  const test = createAction('Test');
  const testSuccess = createAction('Test Success');
  @Injectable()
  class TestEffect extends TraitEffect {
    test$ = createEffect(() => {
      return this.actions$.pipe(ofType(test), map(()=>testSuccess()));
    });
  }

  let actions$: Actions;

  const createService = createServiceFactory({
    service: TestEffect,
    providers: [
      provideMockActions(() => actions$),
      provideMockStore({ initialState: {} }),
    ],
  });
  const destroyedAction = createAction('[Component1] Destroyed');

  it('ngrxOnIdentifyEffects return unique name with componentId or null if not set ', () => {
    const spectator = createService();
    expect(spectator.service.ngrxOnIdentifyEffects()).toEqual('');
    spectator.service.componentId = 'Component1';
    expect(spectator.service.ngrxOnIdentifyEffects()).toEqual(
      'TestEffectComponent1'
    );
  });

  it('if destroy action is fired but componentId is null it should process the effect', async () => {
    const spectator = createService();

    const effect$ = spectator.service.ngrxOnRunEffects(spectator.service.test$);
    actions$ = from([destroyedAction(), test()]);
    //This line is causing an error when refactoring the deprecated 'toPromise' method
    //to use 'firstValueFrom' method.
    const result = await effect$.pipe(first()).toPromise();
    expect(result).toEqual(testSuccess());
  });

  it('if destroy action is fired and componentId is not null it should not the effect', async () => {
    const spectator = createService();

    spectator.service.componentId = 'Component1';
    const effect$ = spectator.service.ngrxOnRunEffects(spectator.service.test$);
    actions$ = from([destroyedAction(), test()]);
    //This line is causing an error when refactoring the deprecated 'toPromise' method
    //to use 'firstValueFrom' method.
    const result = await effect$.toPromise();
    expect(result).toBeUndefined();
  });
});
