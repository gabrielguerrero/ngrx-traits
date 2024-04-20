import {
  Creator,
  EventCreator,
  EventCreatorProps,
  FunctionWithParametersType,
  NotAllowedCheck,
  NotAllowedInPropsCheck,
  TypedEvent,
} from './with-event-handler.model';

// Event creators taken from ngrx and ts-event library and modified a bit to better
// fit current ngrx-traits/signals usage. Thank you Ngrx team and Nicholas Jamieson (@cartant).

export function createEvent<T extends string>(
  type: T,
): EventCreator<T, () => TypedEvent<T>>;
export function createEvent<T extends string, P extends object>(
  type: T,
  config: EventCreatorProps<P> & NotAllowedCheck<P>,
): EventCreator<T, (props: P & NotAllowedCheck<P>) => P & TypedEvent<T>>;
export function createEvent<
  T extends string,
  P extends any[],
  R extends object,
>(
  type: T,
  creator: Creator<P, R & NotAllowedCheck<R>>,
): FunctionWithParametersType<P, R & TypedEvent<T>> & TypedEvent<T>;
/**
 * @description
 * Creates a configured `Creator` function that, when called, returns an object in the shape of the `Event` interface.
 *
 * Event creators reduce the explicitness of class-based event creators.
 *
 * @param type Describes the event that will be dispatched
 * @param config Additional metadata needed for the handling of the event.  See {@link createEvent#usage-notes Usage Notes}.
 *
 * @usageNotes
 *
 * **Declaring an event creator**
 *
 * Without additional metadata:
 * ```ts
 * export const increment = createEvent('[Counter] Increment');
 * ```
 * With additional metadata:
 * ```ts
 * export const loginSuccess = createEvent(
 *   '[Auth/API] Login Success',
 *   props<{ user: User }>()
 * );
 * ```
 * With a function:
 * ```ts
 * export const loginSuccess = createEvent(
 *   '[Auth/API] Login Success',
 *   (response: Response) => response.user
 * );
 * ```
 *
 * **Dispatching an event**
 *
 * Without additional metadata:
 * ```ts
 * store.dispatch(increment());
 * ```
 * With additional metadata:
 * ```ts
 * store.dispatch(loginSuccess({ user: newUser }));
 * ```
 *
 * **Referencing an event in a reducer**
 *
 * Using a switch statement:
 * ```ts
 * switch (event.type) {
 *   // ...
 *   case AuthApiEvents.loginSuccess.type: {
 *     return {
 *       ...state,
 *       user: event.user
 *     };
 *   }
 * }
 * ```
 * Using a reducer creator:
 * ```ts
 * on(AuthApiEvents.loginSuccess, (state, { user }) => ({ ...state, user }))
 * ```
 *
 *  **Referencing an event in an effect**
 * ```ts
 * effectName$ = createEffect(
 *   () => this.events$.pipe(
 *     ofType(AuthApiEvents.loginSuccess),
 *     // ...
 *   )
 * );
 * ```
 */
export function createEvent<T extends string, C extends Creator>(
  type: T,
  config?: { _as: 'props' } | C,
): EventCreator<T> {
  if (typeof config === 'function') {
    return defineType(type, (...args: any[]) => ({
      ...config(...args),
      type,
    }));
  }
  const as = config ? config._as : 'empty';
  switch (as) {
    case 'empty':
      return defineType(type, () => ({ type }));
    case 'props':
      return defineType(type, (props: object) => ({
        ...props,
        type,
      }));
    default:
      throw new Error('Unexpected config.');
  }
}

export function props<
  P extends SafeProps,
  SafeProps = NotAllowedInPropsCheck<P>,
>(): EventCreatorProps<P> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { _as: 'props', _p: undefined! };
}

export function union<
  C extends { [key: string]: EventCreator<string, Creator> },
>(creators: C): ReturnType<C[keyof C]> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return undefined!;
}

function defineType<T extends string>(
  type: T,
  creator: Creator,
): EventCreator<T> {
  return Object.defineProperty(creator, 'type', {
    value: type,
    writable: false,
  }) as EventCreator<T>;
}
