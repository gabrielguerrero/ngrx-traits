import {
  anything,
  deepEqual,
  instance,
  match,
  mock,
  spy,
  verify,
  when,
} from 'ts-mockito';
import { Injectable, Injector } from '@angular/core';
import { ReducerManager } from '@ngrx/store';
import {
  Actions,
  createEffect,
  EffectsModule,
  EffectSources,
  ofType,
} from '@ngrx/effects';
import {
  buildLocalTraits,
  createEntityFeatureFactory,
  EntityFeatureFactory,
  LocalTraitsConfig,
  TraitEffect,
  TraitsLocalStore,
} from 'ngrx-traits';

import { of } from 'rxjs/internal/observable/of';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { createServiceFactory } from '@ngneat/spectator/jest';
import { fakeAsync, tick } from '@angular/core/testing';
import {
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
} from 'ngrx-traits/traits';
import {
  Todo,
  TodoFilter,
} from '../../../traits/src/load-entities/load-entities.trait.spec';
import { mapTo } from 'rxjs/operators';

describe('trait-local-store', () => {
  const traitsFactory = createEntityFeatureFactory(
    { entityName: 'entity', entitiesName: 'entities' },
    addLoadEntitiesTrait<Todo>(),
    addFilterEntitiesTrait<Todo, TodoFilter>()
  );

  @Injectable()
  class TodoTraitLocal extends TraitsLocalStore<typeof traitsFactory> {
    loadEntities$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(this.localActions.loadEntities),
        mapTo(
          this.localActions.loadEntitiesSuccess({
            entities: [{ id: 1, content: 'Test' }],
          })
        )
      );
    });

    setup(): LocalTraitsConfig<typeof traitsFactory> {
      return {
        componentName: 'Test',
        traitsFactory,
      };
    }
  }
  const todoTraitLocalMock = mock(TodoTraitLocal);
  describe('buildLocalTraits', () => {
    function buildLocalTraitsMock<
      State,
      F extends EntityFeatureFactory<any, any>
    >(componentName: string, traitFactory: F, localEffect: TraitEffect) {
      const reducerManagerMock = mock(ReducerManager);
      const effectSourcesMock = mock(EffectSources);
      const actions$ = of();
      const injector = Injector.create({
        providers: [provideMockActions(() => actions$), provideMockStore()],
      });
      const storeMock = spy(injector.get(MockStore));
      const injectorMock = spy(injector);

      when(injectorMock.get(ReducerManager)).thenReturn(
        instance(reducerManagerMock)
      );
      when(injectorMock.get(EffectSources)).thenReturn(
        instance(effectSourcesMock)
      );

      const traits = buildLocalTraits<State, F>(
        instance(injectorMock),
        componentName,
        traitFactory
      );
      traits.addEffects(localEffect);
      return {
        traits,
        injectorMock,
        reducerManagerMock,
        effectSourcesMock,
        storeMock,
      };
    }

    it('should register reducers and effects and build traits', () => {
      const { traits, effectSourcesMock, reducerManagerMock } =
        buildLocalTraitsMock('test', traitsFactory, todoTraitLocalMock);

      verify(effectSourcesMock.addEffects(anything())).twice();
      verify(
        reducerManagerMock.addReducer(match(/test_.+/), anything())
      ).once();
      expect(traits.actions.filterEntities).toBeTruthy();
      expect(traits.selectors.selectEntitiesFilter).toBeTruthy();
    });

    it('should register reducers and effects and build traits, and extra custom effect', () => {
      const { traits, effectSourcesMock, reducerManagerMock } =
        buildLocalTraitsMock('test', traitsFactory, todoTraitLocalMock);

      verify(effectSourcesMock.addEffects(anything())).twice();
      verify(
        reducerManagerMock.addReducer(match(/test_.+/), anything())
      ).once();
      expect(traits.actions.filterEntities).toBeTruthy();
      expect(traits.selectors.selectEntitiesFilter).toBeTruthy();
    });

    it('check when destroy is called reducer is remove and destroy action fired', fakeAsync(() => {
      const { traits, storeMock, reducerManagerMock } = buildLocalTraitsMock(
        'test',
        traitsFactory,
        todoTraitLocalMock
      );
      traits.destroy();
      verify(
        storeMock.dispatch(deepEqual({ type: match(/\[test_.*Destroyed/) }))
      ).once();
      tick();
      verify(reducerManagerMock.removeReducer(match(/test_.*/))).once();
    }));
  });

  describe('TraitsLocalStore', () => {
    @Injectable()
    class TestTrailLocalStore extends TraitsLocalStore<typeof traitsFactory> {
      setup() {
        return {
          componentName: 'test',
          traitsFactory,
          effectFactory: () => {
            @Injectable()
            class MyEffect extends TraitEffect {}
            return MyEffect;
          },
        };
      }
    }
    let actions$: Actions;

    const createService = createServiceFactory({
      service: TestTrailLocalStore,
      imports: [EffectsModule.forRoot()],
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({ initialState: {} }),
      ],
    });

    it('should create TraitsLocalStore instance with  traits', () => {
      const localStore = createService();
      expect(localStore.service.localActions.filterEntities).toBeTruthy();
      expect(
        localStore.service.traits.selectors.selectEntitiesFilter
      ).toBeTruthy();
    });
  });
});
