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
