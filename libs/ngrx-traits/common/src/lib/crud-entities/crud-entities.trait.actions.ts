import { CrudEntitiesActions } from './crud-entities.model';
import { createAction } from '@ngrx/store';
import { Predicate, Update } from '@ngrx/entity';

export function createCrudTraitActions<Entity>(
  actionsGroupKey: string,
  entitiesName: string
): CrudEntitiesActions<Entity> {
  return {
    addEntities: createAction(
      `${actionsGroupKey} Add ${entitiesName}`,
      (...entities: Entity[]) => ({
        entities,
      })
    ),
    removeEntities: createAction(
      `${actionsGroupKey} Remove ${entitiesName}`,
      (...keys: string[] | number[]) => ({
        keys,
      })
    ),
    updateEntities: createAction(
      `${actionsGroupKey} Update ${entitiesName}`,
      (...updates: Update<Entity>[]) => ({
        updates,
      })
    ),
    upsertEntities: createAction(
      `${actionsGroupKey} Upsert ${entitiesName}`,
      (...entities: Entity[]) => ({
        entities,
      })
    ),
    removeAllEntities: createAction(
      `${actionsGroupKey} Remove All ${entitiesName}`,
      (predicate?: Predicate<Entity>) => ({ predicate })
    ),
    clearEntitiesChanges: createAction(
      `${actionsGroupKey} Clear  ${entitiesName} Changes`
    ),
  };
}
