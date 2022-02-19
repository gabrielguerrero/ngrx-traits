import { CrudEntitiesActions } from './crud.model';
import { createAction } from '@ngrx/store';
import { Predicate, Update } from '@ngrx/entity';

export function createCrudTraitActions<Entity>(
  actionsGroupKey: string
): CrudEntitiesActions<Entity> {
  return {
    addEntities: createAction(
      `${actionsGroupKey} Add`,
      (...entities: Entity[]) => ({
        entities,
      })
    ),
    removeEntities: createAction(
      `${actionsGroupKey} Remove`,
      (...keys: string[] | number[]) => ({
        keys,
      })
    ),
    updateEntities: createAction(
      `${actionsGroupKey} Update`,
      (...updates: Update<Entity>[]) => ({
        updates,
      })
    ),
    upsertEntities: createAction(
      `${actionsGroupKey} Upsert`,
      (...entities: Entity[]) => ({
        entities,
      })
    ),
    removeAllEntities: createAction(
      `${actionsGroupKey} Remove All`,
      (predicate?: Predicate<Entity>) => ({ predicate })
    ),
    clearEntitiesChanges: createAction(`${actionsGroupKey} Clear Changes`),
  };
}
