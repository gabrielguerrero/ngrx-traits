import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

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
   * The function accepts the  call parameter and must return a boolean | Signal<boolean> | Observable<boolean>.
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
   * - A `Signal` or `Observable` emitting the parameter of the call or undefined.
   * - A function returning the parameter or undefined.
   *
   * **Warning**: By default, when withCall is a function, signal
   * or observable that when returns a falsy value it will skip the call.
   * To override this behavior, define a skipWhen with your own rule or skipWhen: () => false
   * to always execute on any value.
   */
  callWith?: Param extends Record<string, any> | string | number | boolean
    ?
        | NoInfer<Param>
        | null
        | undefined
        | Signal<NoInfer<Param | null | undefined>>
        | Observable<NoInfer<Param | null | undefined>>
        | (() => NoInfer<Param> | null | undefined)
    : Signal<boolean> | Observable<boolean> | (() => boolean) | boolean;
};

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
