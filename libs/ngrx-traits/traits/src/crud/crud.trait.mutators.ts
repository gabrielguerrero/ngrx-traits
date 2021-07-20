import {
  Change,
  ChangeType,
  CrudKeyedConfig,
  CrudMutators,
  EntityAndCrudState,
} from '../crud/crud.model';
import { Predicate, Update } from '@ngrx/entity';
import { LoadEntitiesKeyedConfig } from '../load-entities/load-entities.model';

export function createCrudTraitMutators<Entity>(
  allConfigs: CrudKeyedConfig & LoadEntitiesKeyedConfig<Entity>
): CrudMutators<Entity> {
  const { storeChanges } = allConfigs.crud || {};
  const adapter = allConfigs!.loadEntities!.adapter;

  function generateChangeEntry(
    entity: Entity,
    changeType: ChangeType,
    customId?: string | number
  ) {
    return {
      id: customId ?? adapter.selectId(entity),
      changeType,
      entityChanges: (storeChanges && entity) || undefined,
    };
  }

  function add<S extends EntityAndCrudState<Entity>>(
    entities: Entity[],
    state: S,
    addFirst = false
  ) {
    const changes = [
      ...state.changes,
      ...entities.map((entity) =>
        generateChangeEntry(entity, ChangeType.CREATED)
      ),
    ];
    if (!addFirst)
      return adapter.addMany(entities, {
        ...state,
        changes,
      });

    const newIds = entities.map((e) => adapter.selectId(e));
    const newEntities = { ...state.entities };
    entities.forEach((e) => {
      const id = adapter.selectId(e);
      newEntities[id] = e;
    });
    return {
      ...state,
      ids: [...newIds, ...state.ids],
      entities: newEntities,
      changes,
    };
  }

  function upsert<S extends EntityAndCrudState<Entity>>(
    entities: Entity[],
    state: S
  ) {
    const oldChanges = [...state.changes];
    const existingIds = adapter.getSelectors().selectIds(state) as string[];

    const [additions, updates] = entities.reduce(
      ([a, u], entity) =>
        existingIds.indexOf(adapter.selectId(entity as Entity) as string) !== -1
          ? [a, [...u, entity]]
          : [[...a, entity], u],
      [new Array<Entity>(), new Array<Entity>()]
    );

    return adapter.upsertMany(entities, {
      ...state,
      changes: [
        ...oldChanges,

        ...additions.map((entity) =>
          generateChangeEntry(entity, ChangeType.CREATED)
        ),
        ...updates.map((entity) =>
          generateChangeEntry(entity, ChangeType.UPDATED)
        ),
      ],
    });
  }

  function remove<S extends EntityAndCrudState<Entity>>(
    keys: number[],
    state: S
  ): S;
  function remove<S extends EntityAndCrudState<Entity>>(
    keys: string[],
    state: S
  ): S;
  function remove<S extends EntityAndCrudState<Entity>>(
    predicate: Predicate<Entity>,
    state: S
  ): S;
  function remove<S extends EntityAndCrudState<Entity>>(
    keysOrPredicate: Predicate<Entity> | string[] | number[],
    state: S
  ): S {
    if (typeof keysOrPredicate === 'function') {
      return adapter.removeMany(keysOrPredicate, {
        ...state,
        changes: [
          ...state.changes,
          ...(state.ids as any[]).map((id) => ({
            id,
            changeType: ChangeType.DELETED,
          })),
        ],
      });
    }

    return adapter.removeMany(keysOrPredicate as string[], {
      ...state,
      changes: [
        ...state.changes,
        ...(keysOrPredicate as string[]).map((key: string) => ({
          id: key,
          changeType: ChangeType.DELETED,
        })),
      ],
    });
  }
  function removeAll<S extends EntityAndCrudState<Entity>>(state: S): S {
    return adapter.removeAll({
      ...state,
      changes: [
        ...state.changes,
        ...(state.ids as any[]).map((id) => ({
          id,
          changeType: ChangeType.DELETED,
        })),
      ],
    });
  }
  function clearChanges<S extends EntityAndCrudState<Entity>>(state: S) {
    return { ...state, changes: [] };
  }

  function update<S extends EntityAndCrudState<Entity>>(
    updates: Update<Entity>[],
    state: S
  ) {
    const oldChanges = [...state.changes];
    updates.forEach((updated) => {
      const id = adapter.selectId(updated.changes as Entity);
      if (id && id !== updated.id) {
        // if the id changes update the id of pold changes
        const index = oldChanges.findIndex((v) => v.id === updated.id);
        const oldChange = oldChanges[index];
        oldChanges[index] = { ...oldChange, id };
      }
    });
    return adapter.updateMany(updates, {
      ...state,
      changes: [
        ...oldChanges,
        ...updates.map(
          (updated) =>
            ({
              id: adapter.selectId(updated.changes as Entity) ?? updated.id,
              changeType: ChangeType.UPDATED,
              entityChanges: (storeChanges && updated.changes) || undefined,
            } as Change<Entity>)
        ),
      ],
    });
  }

  return {
    add,
    remove,
    update,
    removeAll,
    clearChanges,
    upsert,
  };
}
