import { CrudActions } from './crud.model';
import { createAction } from '@ngrx/store';
import { Predicate, Update } from '@ngrx/entity';

export function createCrudTraitActions<Entity>(
  actionsGroupKey: string
): CrudActions<Entity> {
  return {
    add: createAction(`${actionsGroupKey} Add`, (...entities: Entity[]) => ({
      entities,
    })),
    remove: createAction(
      `${actionsGroupKey} Remove`,
      (...keys: string[] | number[]) => ({
        keys,
      })
    ),
    update: createAction(
      `${actionsGroupKey} Update`,
      (...updates: Update<Entity>[]) => ({
        updates,
      })
    ),
    upsert: createAction(
      `${actionsGroupKey} Upsert`,
      (...entities: Entity[]) => ({
        entities,
      })
    ),
    removeAll: createAction(
      `${actionsGroupKey} Remove All`,
      (predicate?: Predicate<Entity>) => ({ predicate })
    ),
    clearChanges: createAction(`${actionsGroupKey} Clear Changes`),
  };
}
