import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CallTypeError,
  IsAny,
  RxMethodRef,
} from '../with-calls/with-calls.model';

type ObservableCall<Param = any, Result = any> = (
  arg: Param,
) => Observable<Result>;

type PromiseCall<Param = any, Result = any> = (arg: Param) => Promise<Result>;

type Call<Param = any, Result = any> =
  | ObservableCall<Param, Result>
  | PromiseCall<Param, Result>;
export type EntityCall<
  Entity,
  Param extends
    | string
    | number
    | Entity
    | ({
        entity: Entity;
      } & Record<string, any>) =
    | string
    | number
    | Entity
    | ({
        entity: Entity;
      } & Record<string, any>),
  Result extends Partial<Entity> | undefined = Partial<Entity> | undefined,
> = Call<Param, Result>;

export type EntityCallConfig<
  Entity = any, // not used inside but is used to pass the entity type to the call
  Param = any,
  Result = any,
  Error = any,
> = {
  /**
   * The main function to be called.
   */
  call: Call<Param, Result>;

  /**
   *  function that returns the entity id in the params
   * @param param
   */
  paramsSelectId?: (param: NoInfer<Param>) => string;

  /**
   * default is true, if false disables automatically storing the result of the
   * function, to allow you do your own implementation using onSuccess.
   */
  storeResult?: boolean;
  /**
   * Callback function invoked on successful completion of the call.
   * Receives the result of the call and the parameter used.
   */
  onSuccess?: (
    result: NoInfer<Result>,
    param: NoInfer<Param>,
    previousResult: NoInfer<Result> | undefined,
  ) => void;

  /**
   * A function to transform an error from the call into a custom `Error` type.
   * Receives the error and the parameter used.
   */
  mapError?: (error: unknown, param: NoInfer<Param>) => Error;

  /**
   * Callback function invoked if the call encounters an error.
   * Receives the mapped error and the parameter used.
   */
  onError?: (error: Error, param: NoInfer<Param>) => void;

  /**
   * A function with condition that determines whether the call should be skipped.
   * The function accepts the  call parameter and must return a boolean | Observable<boolean>.
   */
  skipWhen?:
    | Call<NoInfer<Param>, boolean>
    | (() => boolean)
    | ((
        param: NoInfer<Param>,
        previousResult: NoInfer<Result> | undefined,
      ) => boolean);

  /**
   * Reactively execute the call with the provided params.
   * Supports the following:
   * - A direct parameter value. Which execute the call once on init.
   * - A function or `Observable` emitting the parameter of the call or undefined.
   * - A function returning the parameter or undefined.
   *
   * **Warning**: By default, when withCall is a function, signal
   * or observable that when returns a falsy value it will skip the call.
   * To override this behavior, define a skipWhen with your own rule or skipWhen: () => false
   * to always execute on any value.
   */
  callWith?: Param extends undefined
    ? Observable<boolean> | (() => boolean) | boolean
    :
        | NoInfer<Param>
        | null
        | undefined
        | Observable<NoInfer<Param | null | undefined>>
        | (() => NoInfer<Param> | null | undefined);
};

export type ExtractEntityCallErrorType<
  T extends EntityCall<any> | EntityCallConfig,
> = T extends EntityCallConfig<any, any, any, infer E> ? E : unknown;

export type NamedEntitiesCallsStatusComputed<
  Calls extends Record<string, EntityCall<any> | EntityCallConfig>,
> = {
  [K in keyof Calls as K extends `_${infer J}`
    ? `_isAny${Capitalize<string & J>}Loading`
    : `isAny${Capitalize<string & K>}Loading`]: Signal<boolean>;
} & {
  [K in keyof Calls as K extends `_${infer J}`
    ? `_areAll${Capitalize<string & J>}Loaded`
    : `areAll${Capitalize<string & K>}Loaded`]: Signal<boolean>;
} & {
  [K in keyof Calls as `${K & string}Errors`]: Calls[K] extends EntityCallConfig<
    any,
    any,
    any,
    infer Error
  >
    ? Signal<Error[] | undefined> // TODO map errors with the ids?
    : Signal<unknown | undefined>;
};

export type NamedEntitiesCallsStatusMethods<
  Entity,
  Calls extends Record<string, EntityCall<Entity> | EntityCallConfig>,
> = {
  [K in keyof Calls as K extends `_${infer J}`
    ? `_is${Capitalize<string & J>}Loading`
    : `is${Capitalize<string & K>}Loading`]: (
    entityOrId: Entity | string | number,
  ) => boolean;
} & {
  [K in keyof Calls as K extends `_${infer J}`
    ? `_is${Capitalize<string & J>}Loaded`
    : `is${Capitalize<string & K>}Loaded`]: (
    entityOrId: Entity | string | number,
  ) => boolean;
} & {
  [K in keyof Calls as `${K & string}Error`]: Calls[K] extends EntityCallConfig<
    any,
    any,
    any,
    infer Error
  >
    ? (entityOrId: Entity | string | number) => Error | undefined
    : (entityOrId: Entity | string | number) => unknown | undefined;
};

/**
 * The type of the parameter of an entity call. Taken from the config's `Param`
 * generic rather than from `Parameters` of its `call`, so that a config which
 * is itself callable still reports the parameter the runtime passes.
 *
 * Unlike `withCalls` there is no parameterless case: an entity call has to say
 * which entity it is for, so its parameter is the entity, its id, or an object
 * holding the entity.
 *
 * The call is matched before the config, and the order matters: a function
 * type structurally satisfies `EntityCallConfig`, since `Function.prototype`
 * carries a `call` that is assignable to the config's own `call`. Testing the
 * config first would send every plain function down that branch and widen its
 * parameter to `unknown`. `CallConfig` is immune only because it requires
 * `resultProp`, which a function does not have.
 */
export type ExtractEntityCallParamType<
  T extends EntityCall<any> | EntityCallConfig,
> = T extends (...args: infer A) => any
  ? A[0]
  : T extends EntityCallConfig<any, infer P>
    ? P
    : never;

/**
 * The method generated by `withEntitiesCalls` for a call: takes the call
 * parameter, or a signal, function or observable of it to run reactively, and
 * resolves with the updated entity once the call is loaded or fails.
 *
 * A parameter of `any` is rejected, see `CallTypeError`, since nothing the
 * method looks like could be derived from it.
 */
export type EntityCallMethod<
  Entity,
  T extends EntityCall<any> | EntityCallConfig,
  Param = ExtractEntityCallParamType<T>,
> =
  IsAny<Param> extends true
    ? (
        error: CallTypeError<'withEntitiesCalls: a call parameter of type `any` is not supported, give the call an explicit parameter type'>,
      ) => never
    : {
        (
          param: Param,
        ): Promise<
          | { value: Signal<Entity>; ok: true }
          | { error: Signal<ExtractEntityCallErrorType<T>>; ok: false }
        >;
        (param: Observable<Param> | (() => Param)): RxMethodRef;
      };

export type NamedEntityCallMethods<
  Entity,
  Calls extends Record<string, EntityCall<Entity> | EntityCallConfig>,
> = {
  [K in keyof Calls]: EntityCallMethod<Entity, Calls[K]>;
};
