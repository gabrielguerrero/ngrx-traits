import { signalStore } from '@ngrx/signals';
import { Observable, of } from 'rxjs';

import { CallResource } from '../call-resource/call-resource.model';
import { callConfig } from './call-config';
import { withCalls } from './with-calls';

// compile time only, enforced by `nx typecheck`, which runs tsc over the
// specs: the suites are skipped so their bodies never run, the test below is
// there so vitest does not report an empty file.
describe('withCalls types', () => {
  it('should be checked by tsc', () => {
    expect(true).toBe(true);
  });
});

declare const api: {
  get: (id: string) => Observable<{ name: string }>;
  list: () => Observable<string[]>;
  optional: (id?: string) => Promise<number>;
  nullable: (id: string | undefined) => Observable<number>;
  anyParam: (data: any) => Observable<number>;
};

describe.skip('callConfig', () => {
  it('should accept every storeResult and defaultResult form', () => {
    callConfig({ call: api.list, storeResult: true });
    callConfig({ call: api.list, storeResult: false });
    callConfig({ call: api.list, defaultResult: undefined });
    // contextually typed, no cast needed
    callConfig({ call: api.list, defaultResult: [] });
    callConfig({ call: api.list, defaultResult: [] as string[] });
  });

  it('should reject a defaultResult of another type', () => {
    // @ts-expect-error string is not string[]
    callConfig({ call: api.list, defaultResult: 'nope' });
  });

  it('should reject resultProp and defaultResult with storeResult false', () => {
    // @ts-expect-error nothing is stored, so nothing to name
    callConfig({ call: api.list, storeResult: false, resultProp: 'x' });
    // @ts-expect-error nothing is stored, so nothing to default
    callConfig({ call: api.list, storeResult: false, defaultResult: [] });
  });

  it('should reject unknown props', () => {
    // @ts-expect-error
    callConfig({ call: api.list, foo: 1 });
  });

  it('should keep the resultProp literal', () => {
    const c = callConfig({ call: api.get, resultProp: 'detail' });
    expectTypeOf(c.resultProp).toEqualTypeOf<'detail'>();
  });

  it('should type callWith from the call parameter', () => {
    callConfig({ call: api.get, callWith: '1' });
    callConfig({ call: api.get, callWith: () => '1' });
    callConfig({ call: api.get, callWith: of('1') });
    callConfig({ call: api.get, callWith: () => undefined });
    callConfig({ call: api.list, callWith: true });
    callConfig({ call: api.list, callWith: () => false });
    callConfig({ call: api.optional, callWith: () => 'a' });
    // @ts-expect-error number is not string
    callConfig({ call: api.get, callWith: 1 });
    // @ts-expect-error the call has no parameter
    callConfig({ call: api.list, callWith: 'x' });
  });

  it('should type the callbacks from the call and mapError', () => {
    callConfig({
      call: api.get,
      mapError: (error) => String(error),
      onSuccess: (result, param, previous) => {
        expectTypeOf(result).toEqualTypeOf<{ name: string }>();
        expectTypeOf(param).toEqualTypeOf<string>();
        expectTypeOf(previous).toEqualTypeOf<{ name: string } | undefined>();
      },
      onError: (error, param) => {
        expectTypeOf(error).toEqualTypeOf<string>();
        expectTypeOf(param).toEqualTypeOf<string>();
      },
      skipWhen: (param, previous) => {
        expectTypeOf(param).toEqualTypeOf<string>();
        expectTypeOf(previous).toEqualTypeOf<{ name: string } | undefined>();
        return false;
      },
    });
  });
});

const Store = signalStore(
  withCalls(() => ({
    plain: api.get,
    renamed: callConfig({ call: api.get, resultProp: 'detail' }),
    withDefault: callConfig({ call: api.list, defaultResult: [] }),
    noResult: callConfig({ call: api.list, storeResult: false }),
    optional: api.optional,
    optionalConfig: callConfig({ call: api.optional }),
    nullable: callConfig({ call: api.nullable }),
    mapped: callConfig({ call: api.get, mapError: (e) => String(e) }),
    noParams: callConfig({ call: api.list }),
  })),
);
// type only, the store is never created
declare const store: InstanceType<typeof Store>;

describe.skip('a call parameter of any', () => {
  // `any` satisfies a test against `undefined`, so without a guard the call
  // would be read as one without a parameter, and there is no shape to
  // generate for it either. It is rejected where the call is written, so the
  // message lands on the call and not on every use of its method
  it('should be rejected on a plain function', () => {
    signalStore(
      withCalls(() => ({
        // @ts-expect-error a parameter of any is not supported
        anyParam: api.anyParam,
      })),
    );
  });

  it('should be rejected in a callConfig', () => {
    // @ts-expect-error a parameter of any is not supported
    callConfig({ call: api.anyParam });
    // @ts-expect-error a parameter of any is not supported
    callConfig({ call: api.anyParam, storeResult: false });
  });

  it('should not reject a call that simply has no parameter', () => {
    signalStore(withCalls(() => ({ none: api.list })));
    callConfig({ call: api.list });
  });
});

describe.skip('withCalls', () => {
  it('should type the result props', () => {
    expectTypeOf(store.plainResult()).toEqualTypeOf<
      { name: string } | undefined
    >();
    expectTypeOf(store.detail()).toEqualTypeOf<{ name: string } | undefined>();
    // @ts-expect-error stored under resultProp
    store.renamedResult;
    expectTypeOf(store.withDefaultResult()).toEqualTypeOf<string[]>();
    // @ts-expect-error not stored
    store.noResultResult;
    expectTypeOf(store.optionalResult()).toEqualTypeOf<number | undefined>();
  });

  it('should type the errors', () => {
    expectTypeOf(store.plainError()).toEqualTypeOf<unknown>();
    expectTypeOf(store.mappedError()).toEqualTypeOf<string | undefined>();
  });

  it('should require the parameter of the call', () => {
    store.plain('1');
    store.renamed('1');
    // @ts-expect-error a required parameter
    store.plain(undefined);
    // @ts-expect-error a required parameter
    store.renamed(undefined);
    // @ts-expect-error a required parameter
    store.renamed();
    // @ts-expect-error not the parameter type
    store.renamed(1);
  });

  it('should take no parameter when the call has none', () => {
    store.noParams();
    // @ts-expect-error the call has no parameter
    store.noParams('x');
    // @ts-expect-error the call has no parameter
    store.noParams(of('x'));
  });

  it('should make the parameter optional when the call parameter is', () => {
    store.optional();
    store.optional('x');
    store.optional(undefined);
    store.optionalConfig();
    store.optionalConfig('x');
    store.nullable();
    store.nullable(undefined);
    store.nullable('x');
    // @ts-expect-error not the parameter type
    store.optional(1);
  });

  it('should not resolve a value for a call that does not store its result', async () => {
    const result = await store.noResult();
    if (result.ok) {
      // @ts-expect-error there is no value to resolve with
      result.value;
    } else {
      expectTypeOf(result.error()).toEqualTypeOf<unknown>();
    }
  });

  it('should accept a signal, function or observable of the parameter', () => {
    store.renamed(of('1'));
    store.renamed(() => '1');
    expectTypeOf(store.renamed(of('1'))).toHaveProperty('destroy');
    // @ts-expect-error not the parameter type
    store.renamed(of(1));
    // @ts-expect-error not the parameter type
    store.renamed(() => 1);
  });

  it('should resolve the call result', async () => {
    const result = await store.renamed('1');
    if (result.ok) {
      expectTypeOf(result.value()).toEqualTypeOf<
        { name: string } | undefined
      >();
      // @ts-expect-error only on failure
      result.error;
    } else {
      expectTypeOf(result.error()).toEqualTypeOf<unknown>();
    }
    const mapped = await store.mapped('1');
    if (!mapped.ok) expectTypeOf(mapped.error()).toEqualTypeOf<string>();
    const withDefault = await store.withDefault();
    if (withDefault.ok) {
      expectTypeOf(withDefault.value()).toEqualTypeOf<string[]>();
    }
  });

  it('should type the resource from the call', () => {
    expectTypeOf(store.withDefaultResource()).toEqualTypeOf<
      CallResource<string[], unknown>
    >();
    expectTypeOf(store.detailResource()).toEqualTypeOf<
      CallResource<{ name: string } | undefined, unknown>
    >();
    expectTypeOf(store.mappedResource().error()).toEqualTypeOf<
      string | undefined
    >();
    // @ts-expect-error not stored, so no resource
    store.noResultResource;
    store.detailResource({ params: () => '1' });
    store.detailResource({ params: () => undefined });
    store.detailResource({ params: of('1') });
    // @ts-expect-error not the parameter type
    store.detailResource({ params: () => 1 });
    // @ts-expect-error the call has no parameter
    store.noParamsResource({ params: () => undefined });
    store.optionalResource({ params: () => 'x' });
  });
});
