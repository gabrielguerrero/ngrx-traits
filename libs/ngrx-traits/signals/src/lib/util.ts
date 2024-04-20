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
