export interface Event {
  type: string;
}

// declare to make it property-renaming safe
export declare interface TypedEvent<T extends string> extends Event {
  readonly type: T;
}

export type EventType<A> =
  A extends EventCreator<infer T, infer C>
    ? ReturnType<C> & { type: T }
    : never;

export type TypeId<T> = () => T;

export type InitialState<T> = Partial<T> | TypeId<Partial<T>> | void;

/**
 * A function that takes an `Event` and a `State`, and returns a `State`.
 * See `createReducer`.
 */
export interface EventReducer<T, V extends Event = Event> {
  (state: T | undefined, event: V): T;
}

export type EventReducerMap<T, V extends Event = Event> = {
  [p in keyof T]: EventReducer<T[p], V>;
};

export interface EventReducerFactory<T, V extends Event = Event> {
  (
    reducerMap: EventReducerMap<T, V>,
    initialState?: InitialState<T>,
  ): EventReducer<T, V>;
}

export const arraysAreNotAllowedMsg = 'event creator cannot return an array';
type ArraysAreNotAllowed = typeof arraysAreNotAllowedMsg;

export const typePropertyIsNotAllowedMsg =
  'event creator cannot return an object with a property named `type`';
type TypePropertyIsNotAllowed = typeof typePropertyIsNotAllowedMsg;

export const emptyObjectsAreNotAllowedMsg =
  'event creator cannot return an empty object';
type EmptyObjectsAreNotAllowed = typeof emptyObjectsAreNotAllowedMsg;

export const arraysAreNotAllowedInProps =
  'event creator props cannot be an array';
type ArraysAreNotAllowedInProps = typeof arraysAreNotAllowedInProps;

export const typePropertyIsNotAllowedInProps =
  'event creator props cannot have a property named `type`';
type TypePropertyIsNotAllowedInProps = typeof typePropertyIsNotAllowedInProps;

export const emptyObjectsAreNotAllowedInProps =
  'event creator props cannot be an empty object';
type EmptyObjectsAreNotAllowedInProps = typeof emptyObjectsAreNotAllowedInProps;

export const primitivesAreNotAllowedInProps =
  'event creator props cannot be a primitive value';
type PrimitivesAreNotAllowedInProps = typeof primitivesAreNotAllowedInProps;

export type FunctionIsNotAllowed<
  T,
  ErrorMessage extends string,
> = T extends Function ? ErrorMessage : T;
/**
 * A function that returns an object in the shape of the `Event` interface.  Configured using `createEvent`.
 */
export type Creator<
  P extends any[] = any[],
  R extends object = object,
> = FunctionWithParametersType<P, R>;

export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;

export type NotAllowedCheck<T extends object> = T extends any[]
  ? ArraysAreNotAllowed
  : T extends { type: any }
    ? TypePropertyIsNotAllowed
    : keyof T extends never
      ? EmptyObjectsAreNotAllowed
      : unknown;

export type NotAllowedInPropsCheck<T> = T extends object
  ? T extends any[]
    ? ArraysAreNotAllowedInProps
    : T extends { type: any }
      ? TypePropertyIsNotAllowedInProps
      : keyof T extends never
        ? EmptyObjectsAreNotAllowedInProps
        : unknown
  : T extends Primitive
    ? PrimitivesAreNotAllowedInProps
    : never;

/**
 * See `Creator`.
 */
export type EventCreator<
  T extends string = string,
  C extends Creator = Creator,
> = C & TypedEvent<T>;

export interface EventCreatorProps<T> {
  _as: 'props';
  _p: T;
}

export type FunctionWithParametersType<P extends unknown[], R = void> = (
  ...args: P
) => R;
