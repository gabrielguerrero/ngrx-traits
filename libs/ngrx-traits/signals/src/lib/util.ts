export function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getWithEntitiesKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  return {
    idsKey: collection ? `${config.collection}Ids` : 'ids',
    entitiesKey: collection ? `${config.collection}Entities` : 'entities',
    entityMapKey: collection ? `${config.collection}EntityMap` : 'entityMap',
  };
}
export function toMap(a: Array<string | number>) {
  return a.reduce((acum: { [key: string]: boolean }, value) => {
    acum[value] = true;
    return acum;
  }, {});
}
export function insertIf<T>(condition: any, getElement: () => T): [T] {
  return (condition ? [getElement()] : []) as [T];
}

export type OverridableFunction = {
  (...args: any[]): void;
  impl?: (...args: unknown[]) => void;
};

export function combineFunctions(
  previous?: OverridableFunction,
  next?: (...args: any[]) => void,
): OverridableFunction {
  if (previous && !next) {
    return previous;
  }
  const previousImplementation = previous?.impl;
  const fun: OverridableFunction =
    previous ??
    ((...args: any[]) => {
      fun.impl?.(...args);
    });
  fun.impl = next
    ? (...args: any[]) => {
        previousImplementation?.(...args);
        next(...args);
      }
    : undefined;
  return fun;
}

/**
 * Combines the implementation of a function defined in the store with
 * a new implementation of the same type
 * the resulting call will execute both functions when called,
 * @param param
 * @param store
 */
export function combineFunctionsInObject<
  T extends Record<string | symbol, Function | undefined>,
>(param: T, store: Record<string | symbol, unknown>): T {
  const replaceProps = (
    acc: Record<string | symbol, Function>,
    key: string | symbol,
  ) => {
    let value = param[key];
    value = combineFunctions(
      store[key] as OverridableFunction,
      value as (...args: any[]) => void,
    );
    if (!store[key]) acc[key] = value;
    return acc;
  };
  let result = Object.keys(param).reduce(
    replaceProps,
    {} as Record<string | symbol, Function>,
  );
  result = Object.getOwnPropertySymbols(param).reduce(replaceProps, result);
  return result as T;
}
