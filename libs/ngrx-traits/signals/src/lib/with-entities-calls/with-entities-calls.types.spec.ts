import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { Observable, of } from 'rxjs';

import { withCallStatus } from '../with-call-status/with-call-status';
import { entityCallConfig } from './entity-call-config';
import { withEntitiesCalls } from './with-entities-calls';

// compile time only, enforced by `nx typecheck`, which runs tsc over the
// specs: the suites are skipped so their bodies never run, the test below is
// there so vitest does not report an empty file.
describe('withEntitiesCalls types', () => {
  it('should be checked by tsc', () => {
    expect(true).toBe(true);
  });
});

type Product = { id: string; name: string };
declare const api: {
  byId: (param: { id: string }) => Observable<Product>;
  byEntity: (param: Product) => Observable<Product>;
  byWrapped: (param: { entity: Product; extra: number }) => Promise<Product>;
  byStringId: (id: string) => Observable<Product>;
  anyParam: (param: any) => Observable<Product>;
};

describe.skip('entityCallConfig', () => {
  it('should accept every storeResult form', () => {
    entityCallConfig({ call: api.byEntity, storeResult: true });
    entityCallConfig({ call: api.byEntity, storeResult: false });
    entityCallConfig({
      call: api.byId,
      storeResult: false,
      paramsSelectId: ({ id }) => id,
    });
  });

  it('should reject unknown props', () => {
    // @ts-expect-error
    entityCallConfig({ call: api.byEntity, foo: 1 });
  });

  it('should type callWith from the call parameter', () => {
    entityCallConfig({
      call: api.byId,
      paramsSelectId: ({ id }) => id,
      callWith: () => ({ id: '1' }),
    });
    entityCallConfig({
      call: api.byId,
      paramsSelectId: ({ id }) => id,
      // @ts-expect-error not the parameter type
      callWith: 1,
    });
  });

  it('should type the callbacks from the call and mapError', () => {
    entityCallConfig({
      call: api.byId,
      paramsSelectId: ({ id }) => id,
      mapError: (error) => String(error),
      onSuccess: (result, param, previous) => {
        expectTypeOf(result).toEqualTypeOf<Product>();
        expectTypeOf(param).toEqualTypeOf<{ id: string }>();
        expectTypeOf(previous).toEqualTypeOf<Product | undefined>();
      },
      onError: (error, param) => {
        expectTypeOf(error).toEqualTypeOf<string>();
        expectTypeOf(param).toEqualTypeOf<{ id: string }>();
      },
    });
  });
});

const Store = signalStore(
  withEntities({ entity: type<Product>() }),
  withCallStatus(),
  withEntitiesCalls({
    entity: type<Product>(),
    calls: () => ({
      plain: api.byEntity,
      byId: entityCallConfig({
        call: api.byId,
        paramsSelectId: ({ id }) => id,
      }),
      byEntity: entityCallConfig({ call: api.byEntity }),
      byWrapped: entityCallConfig({ call: api.byWrapped }),
      byStringId: entityCallConfig({ call: api.byStringId }),
      mapped: entityCallConfig({
        call: api.byId,
        paramsSelectId: ({ id }) => id,
        mapError: (error) => String(error),
      }),
      // @ts-expect-error paramsSelectId is required when the param is not the entity or its id
      bad: entityCallConfig({ call: api.byId }),
    }),
  }),
);
// type only, the store is never created
declare const store: InstanceType<typeof Store>;

const AnyParamStore = signalStore(
  withEntities({ entity: type<Product>() }),
  withCallStatus(),
  withEntitiesCalls({
    entity: type<Product>(),
    calls: () => ({ anyParam: api.anyParam }),
  }),
);
declare const anyParamStore: InstanceType<typeof AnyParamStore>;

describe.skip('an entity call parameter of any', () => {
  // there is no parameterless entity call, so the branch that used to catch
  // this typed it `() => void`, losing both the parameter and the promise. It
  // is rejected where the call is written instead
  it('should be rejected when a plain function call is used', () => {
    // only at the use site for a plain function: validating the calls record
    // costs the inference that makes paramsSelectId required, which matters
    // more, so the config form carries the declaration site check
    // @ts-expect-error a parameter of any is not supported
    anyParamStore.anyParam({ id: '1' });
  });

  it('should be rejected in an entityCallConfig', () => {
    // @ts-expect-error a parameter of any is not supported
    entityCallConfig({ call: api.anyParam, paramsSelectId: ({ id }) => id });
  });
});

describe.skip('withEntitiesCalls', () => {
  it('should require the parameter of the call', () => {
    store.byId({ id: '1' });
    store.byEntity({ id: '1', name: 'x' });
    store.byWrapped({ entity: { id: '1', name: 'x' }, extra: 1 });
    store.byStringId('1');
    // @ts-expect-error a required parameter
    store.byId(undefined);
    // @ts-expect-error a required parameter
    store.byId();
    // @ts-expect-error not the parameter type
    store.byId({ id: 1 });
  });

  it('should type the parameter of a plain function call', () => {
    // a function type structurally satisfies EntityCallConfig, so extracting
    // the parameter in the wrong order widens this to unknown and accepts
    // anything
    store.plain({ id: '1', name: 'x' });
    // @ts-expect-error not the parameter type
    store.plain(123);
    // @ts-expect-error not the parameter type
    store.plain({ totally: 'wrong' });
    // @ts-expect-error not the parameter type
    store.plain(undefined);
  });

  it('should return a method ref for the reactive form', () => {
    expectTypeOf(store.plain(of({ id: '1', name: 'x' }))).toHaveProperty(
      'destroy',
    );
    expectTypeOf(store.byId(() => ({ id: '1' }))).toHaveProperty('destroy');
    expectTypeOf(store.byId(of({ id: '1' }))).toHaveProperty('destroy');
    // @ts-expect-error not the parameter type
    store.byId(of({ id: 1 }));
  });

  it('should type the errors', () => {
    expectTypeOf(store.plainError('1')).toEqualTypeOf<unknown>();
    expectTypeOf(store.byIdError('1')).toEqualTypeOf<unknown>();
    expectTypeOf(store.mappedError('1')).toEqualTypeOf<string | undefined>();
  });

  it('should type the errors signal from mapError, not from the result', () => {
    // the generic position is easy to miss: Error is the fourth of
    // EntityCallConfig, the third is Result
    expectTypeOf(store.mappedErrors()).toEqualTypeOf<string[] | undefined>();
    expectTypeOf(store.byIdErrors()).toEqualTypeOf<unknown[] | undefined>();
  });

  it('should resolve the call result', async () => {
    const result = await store.byId({ id: '1' });
    if (result.ok) expectTypeOf(result.value()).toEqualTypeOf<Product>();
    const mapped = await store.mapped({ id: '1' });
    if (!mapped.ok) expectTypeOf(mapped.error()).toEqualTypeOf<string>();
  });
});
