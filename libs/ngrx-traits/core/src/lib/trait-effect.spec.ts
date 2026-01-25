import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TraitEffect } from '@ngrx-traits/core';
import { createAction } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { first, map } from 'rxjs/operators';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { from, Observable } from 'rxjs';

describe('TraitEffect', () => {
  const test = createAction('Test');
  const testSuccess = createAction('Test Success');

  @Injectable()
  class TestEffect extends TraitEffect {
    test$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(test),
        map(() => testSuccess())
      );
    });
  }

  let actions$: Observable<any>;
  let testEffect: TestEffect;
  const destroyedAction = createAction('[Component1] Destroyed');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestEffect,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: {} }),
      ],
    });
    testEffect = TestBed.inject(TestEffect);
  });

  it('ngrxOnIdentifyEffects return unique name with componentId or null if not set ', () => {
    expect(testEffect.ngrxOnIdentifyEffects()).toEqual('');
    testEffect.componentId = 'Component1';
    expect(testEffect.ngrxOnIdentifyEffects()).toEqual('TestEffectComponent1');
  });

  it('if destroy action is fired but componentId is null it should process the effect', async () => {
    const effect$ = testEffect.ngrxOnRunEffects(testEffect.test$);
    actions$ = from([destroyedAction(), test()]);
    const result = await effect$.pipe(first()).toPromise();
    expect(result).toEqual(testSuccess());
  });

  it('if destroy action is fired and componentId is not null it should not the effect', async () => {
    testEffect.componentId = 'Component1';
    const effect$ = testEffect.ngrxOnRunEffects(testEffect.test$);
    actions$ = from([destroyedAction(), test()]);
    const result = await effect$.toPromise();
    expect(result).toBeUndefined();
  });
});
