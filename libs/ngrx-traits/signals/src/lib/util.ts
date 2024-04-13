export function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export function getWithEntitiesKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  return {
    idsKey: collection ? `${config.collection}Ids` : 'ids',
    entitiesKey: collection ? `${config.collection}Entities` : 'entities',
    entityMapKey: collection ? `${config.collection}EntityMap` : 'entityMap',
    clearEntitiesCacheKey: collection
      ? `clearEntities${config.collection}Cache`
      : 'clearEntitiesCache',
  };
}

export type OverridableFunction = {
  (...args: unknown[]): void;
  impl?: (...args: unknown[]) => void;
};

export function combineFunctions(
  previous?: OverridableFunction,
  next?: (...args: unknown[]) => void,
): OverridableFunction {
  if (previous && !next) {
    return previous;
  }
  const previousImplementation = previous?.impl;
  const fun: OverridableFunction =
    previous ??
    ((...args: unknown[]) => {
      fun.impl?.(...args);
    });
  fun.impl = next
    ? (...args: unknown[]) => {
        previousImplementation?.(...args);
        next(...args);
      }
    : undefined;
  return fun;
}
