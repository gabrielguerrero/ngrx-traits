import { signal } from '@angular/core';
import { patchState, signalStore, type, withMethods } from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';

import { withEntitiesMultiSelection } from './with-entities-multi-selection';
import { withEntitiesSingleSelection } from './with-entities-single-selection';
import { withLinkEntitiesMultiSelection } from './with-link-entities-multi-selection';
import { withLinkEntitiesSingleSelection } from './with-link-entities-single-selection';

// compile time only, enforced by `nx typecheck`, which runs tsc over the
// specs: the suites are skipped so their bodies never run, the test below is
// there so vitest does not report an empty file.
describe('withEntities*Selection types', () => {
  it('should be checked by tsc', () => {
    expect(true).toBe(true);
  });
});

type NumberId = { id: number; code: string };
type NoId = { code: string };
type LiteralId = { id: 'a' | 'b' };
enum Status {
  Open = 'open',
  Closed = 'closed',
}
type EnumId = { id: Status };

describe.skip('withEntitiesSingleSelection', () => {
  it('should type ids from the entity id prop', () => {
    const config = entityConfig({
      entity: type<NumberId>(),
      collection: 'product',
    });
    const Store = signalStore(
      withEntities(config),
      withEntitiesSingleSelection(config),
      withLinkEntitiesSingleSelection(config),
    );
    const store = new Store();
    expectTypeOf(store.productIdSelected()).toEqualTypeOf<number | undefined>();
    expectTypeOf(store.linkProductIdSelected()()).toEqualTypeOf<
      number | null
    >();
    store.selectProductEntity({ id: 1 });
    // @ts-expect-error the id is a number
    store.selectProductEntity({ id: '1' });
  });

  it('should type ids from the entity id prop without a collection', () => {
    const entity = type<NumberId>();
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesSingleSelection({ entity }),
      withLinkEntitiesSingleSelection({ entity }),
    );
    const store = new Store();
    expectTypeOf(store.idSelected()).toEqualTypeOf<number | undefined>();
    expectTypeOf(store.linkIdSelected()()).toEqualTypeOf<number | null>();
  });

  it('should type ids from the entity id prop in the two-arg and factory forms', () => {
    const config = entityConfig({
      entity: type<NumberId>(),
      collection: 'product',
    });
    const TwoArg = signalStore(
      withEntities(config),
      withEntitiesSingleSelection(config, { defaultSelectedId: 1 }),
    );
    expectTypeOf(new TwoArg().productIdSelected()).toEqualTypeOf<
      number | undefined
    >();
    const Factory = signalStore(
      withEntities(config),
      withEntitiesSingleSelection(() => ({ ...config, clearOnFilter: false })),
    );
    expectTypeOf(new Factory().productIdSelected()).toEqualTypeOf<
      number | undefined
    >();
    signalStore(
      withEntities(config),
      // @ts-expect-error the id is a number
      withEntitiesSingleSelection(config, { defaultSelectedId: '1' }),
    );
  });

  it('should keep string | number with the selectId of the ngrx entityConfig', () => {
    const config = entityConfig({
      entity: type<NumberId>(),
      collection: 'product',
      selectId: (entity) => entity.code,
    });
    const Store = signalStore(
      withEntities(config),
      withEntitiesSingleSelection(config),
      withLinkEntitiesSingleSelection(config),
    );
    const store = new Store();
    expectTypeOf(store.productIdSelected()).toEqualTypeOf<
      string | number | undefined
    >();
    expectTypeOf(store.linkProductIdSelected()()).toEqualTypeOf<
      string | number | null
    >();
  });

  it('should link null and undefined typed signals, emitting only null', () => {
    const entity = type<NumberId>();
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesSingleSelection({ entity }),
      withLinkEntitiesSingleSelection({ entity }),
    );
    const store = new Store();
    // emits null, so a null typed signal needs no map either way
    store.linkIdSelected({ syncWith: signal<number | null>(null) });
    store.linkIdSelected({ writeTo: signal<number | null>(null) });
    // accepts undefined, so an undefined typed source needs no map
    store.linkIdSelected({ readFrom: signal<number | undefined>(undefined) });
    // but it never emits undefined, so the other way needs a writeMap
    // @ts-expect-error writeMap is required
    store.linkIdSelected({ syncWith: signal<number | undefined>(undefined) });
    store.linkIdSelected({
      syncWith: signal<number | undefined>(undefined),
      writeMap: (id) => id ?? undefined,
    });
    store.linkIdSelected().set(null);
    // @ts-expect-error the link is typed to emit and take null, not undefined
    store.linkIdSelected().set(undefined);
  });

  it('should pass Id | null to writeMap, and need one for a signal without null', () => {
    const entity = type<NumberId>();
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesSingleSelection({ entity }),
      withLinkEntitiesSingleSelection({ entity }),
    );
    const store = new Store();
    store.linkIdSelected({
      syncWith: signal<number>(0),
      writeMap: (id, skip) => {
        expectTypeOf(id).toEqualTypeOf<number | null>();
        return id ?? skip();
      },
    });
    // @ts-expect-error writeMap is required, the link emits null
    store.linkIdSelected({ syncWith: signal<number>(0) });
  });

  it('should type literal and enum ids', () => {
    const literal = type<LiteralId>();
    const LiteralStore = signalStore(
      { protectedState: false },
      withEntities({ entity: literal }),
      withEntitiesSingleSelection({ entity: literal }),
    );
    const literalStore = new LiteralStore();
    expectTypeOf(literalStore.idSelected()).toEqualTypeOf<
      'a' | 'b' | undefined
    >();
    literalStore.selectEntity({ id: 'a' });
    // @ts-expect-error not one of the ids
    literalStore.selectEntity({ id: 'c' });
    patchState(literalStore, { idSelected: undefined });

    const enumEntity = type<EnumId>();
    const EnumStore = signalStore(
      withEntities({ entity: enumEntity }),
      withEntitiesSingleSelection({ entity: enumEntity }),
    );
    expectTypeOf(new EnumStore().idSelected()).toEqualTypeOf<
      Status | undefined
    >();
  });

  it('should type ids from an inline selectId in the factory form', () => {
    const entity = type<NumberId>();
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesSingleSelection(() => ({
        entity,
        selectId: (product) => product.code,
      })),
    );
    expectTypeOf(new Store().idSelected()).toEqualTypeOf<string | undefined>();
  });

  it('should type ids from a config whose selectId keeps its return type', () => {
    // what an entityConfig that infers the selectId return type would give
    const config = {
      entity: type<NumberId>(),
      collection: 'product' as const,
      selectId: (entity: NumberId) => entity.code,
    };
    const Store = signalStore(
      withEntities(config),
      withEntitiesSingleSelection(config),
      withLinkEntitiesSingleSelection(config),
      withMethods((store) => ({
        // still accepted by the ngrx entity updaters
        set(products: NumberId[]) {
          patchState(store, setAllEntities(products, config));
        },
      })),
    );
    const store = new Store();
    expectTypeOf(store.productIdSelected()).toEqualTypeOf<string | undefined>();
    expectTypeOf(store.linkProductIdSelected()()).toEqualTypeOf<
      string | null
    >();
    store.selectProductEntity({ id: 'a' });
    // @ts-expect-error the id is the code, a string
    store.selectProductEntity({ id: 1 });
  });

  it('should keep string | number when the entity has no id prop', () => {
    const entity = type<NoId>();
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesSingleSelection({ entity }),
    );
    expectTypeOf(new Store().idSelected()).toEqualTypeOf<
      string | number | undefined
    >();
  });
});

describe.skip('withEntitiesMultiSelection', () => {
  it('should type ids from the entity id prop', () => {
    const config = entityConfig({
      entity: type<NumberId>(),
      collection: 'product',
    });
    const Store = signalStore(
      withEntities(config),
      withEntitiesMultiSelection(config),
      withLinkEntitiesMultiSelection(config),
    );
    const store = new Store();
    expectTypeOf(store.productIdsSelected()).toEqualTypeOf<number[]>();
    expectTypeOf(store.productIdsSelectedMap()).toEqualTypeOf<
      Partial<Record<number, boolean>>
    >();
    expectTypeOf(store.linkProductIdsSelected()()).toEqualTypeOf<number[]>();
    store.selectProductEntities({ ids: [1, 2] });
    // @ts-expect-error the id is a number
    store.deselectProductEntities({ id: '1' });
  });

  it('should type ids from the entity id prop in the two-arg form', () => {
    const entity = type<NumberId>();
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesMultiSelection({ entity }, { defaultSelectedIds: [1] }),
      withLinkEntitiesMultiSelection({ entity }),
    );
    const store = new Store();
    expectTypeOf(store.idsSelected()).toEqualTypeOf<number[]>();
    expectTypeOf(store.linkIdsSelected()()).toEqualTypeOf<number[]>();
  });

  it('should keep string | number with the selectId of the ngrx entityConfig', () => {
    const config = entityConfig({
      entity: type<NumberId>(),
      collection: 'product',
      selectId: (entity) => entity.code,
    });
    const Store = signalStore(
      withEntities(config),
      withEntitiesMultiSelection(config),
      withLinkEntitiesMultiSelection(config),
    );
    const store = new Store();
    expectTypeOf(store.productIdsSelected()).toEqualTypeOf<
      (string | number)[]
    >();
    expectTypeOf(store.linkProductIdsSelected()()).toEqualTypeOf<
      (string | number)[]
    >();
  });

  it('should type literal and enum ids, with a map that needs no key', () => {
    const literal = type<LiteralId>();
    const LiteralStore = signalStore(
      { protectedState: false },
      withEntities({ entity: literal }),
      withEntitiesMultiSelection({ entity: literal }),
    );
    const literalStore = new LiteralStore();
    expectTypeOf(literalStore.idsSelected()).toEqualTypeOf<('a' | 'b')[]>();
    // the map starts empty, so no id is a required key
    patchState(literalStore, { idsSelectedMap: {} });
    patchState(literalStore, { idsSelectedMap: { a: true } });
    // @ts-expect-error not one of the ids
    patchState(literalStore, { idsSelectedMap: { c: true } });

    const enumEntity = type<EnumId>();
    const EnumStore = signalStore(
      { protectedState: false },
      withEntities({ entity: enumEntity }),
      withEntitiesMultiSelection({ entity: enumEntity }),
      withLinkEntitiesMultiSelection({ entity: enumEntity }),
    );
    const enumStore = new EnumStore();
    expectTypeOf(enumStore.idsSelected()).toEqualTypeOf<Status[]>();
    expectTypeOf(enumStore.linkIdsSelected()()).toEqualTypeOf<Status[]>();
    patchState(enumStore, { idsSelectedMap: { [Status.Open]: true } });
  });

  it('should type ids from an inline selectId in the factory form', () => {
    const entity = type<NumberId>();
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesMultiSelection(() => ({
        entity,
        selectId: (product) => product.code,
      })),
    );
    expectTypeOf(new Store().idsSelected()).toEqualTypeOf<string[]>();
  });

  it('should type ids from an inline selectId', () => {
    const entity = type<NumberId>();
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesMultiSelection({
        entity,
        selectId: (product) => product.code,
      }),
    );
    expectTypeOf(new Store().idsSelected()).toEqualTypeOf<string[]>();
  });

  it('should type ids from a config whose selectId keeps its return type', () => {
    const config = {
      entity: type<NumberId>(),
      collection: 'product' as const,
      selectId: (entity: NumberId) => entity.code,
    };
    const Store = signalStore(
      withEntities(config),
      withEntitiesMultiSelection(config),
      withLinkEntitiesMultiSelection(config),
    );
    const store = new Store();
    expectTypeOf(store.productIdsSelected()).toEqualTypeOf<string[]>();
    expectTypeOf(store.linkProductIdsSelected()()).toEqualTypeOf<string[]>();
  });
});
