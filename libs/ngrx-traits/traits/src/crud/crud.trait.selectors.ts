import { createSelector } from '@ngrx/store';
import {
  Change,
  ChangeType,
  CrudSelectors,
  CrudState,
  EntityAndCrudState,
  EntityChange,
} from './crud.model';
import { LoadEntitiesSelectors } from '../load-entities/load-entities.model';
import { Dictionary } from '@ngrx/entity';

export function createCrudTraitSelectors<Entity>(
  previousSelectors: LoadEntitiesSelectors<Entity>
): CrudSelectors<Entity> {
  function selectChanges<S extends CrudState<Entity>>(state: S) {
    return state.changes;
  }

  function selectFilteredChanges<S extends CrudState<Entity>>(state: S) {
    const cache: { [id: string]: ChangeType[] } = {};
    return state.changes.reduce((acc, value) => {
      const changes = cache[value.id];
      if (!changes) {
        cache[value.id] = [value.changeType];
        acc.push(value);
        return acc;
      }

      if (value.changeType === ChangeType.UPDATED) {
        return acc;
      }

      if (
        value.changeType === ChangeType.DELETED &&
        changes.includes(ChangeType.CREATED)
      ) {
        delete cache[value.id];
        return acc.filter((v) => v.id !== value.id);
      }

      if (value.changeType === ChangeType.DELETED) {
        delete cache[value.id];
        const newAcc = acc.filter((v) => v.id !== value.id);
        newAcc.push(value);
        return newAcc;
      }
      return acc;
    }, [] as Change<Entity>[]);
  }

  const { selectEntitiesMap } = previousSelectors;

  const selectEntitiesChangesList = createSelector(
    (state: EntityAndCrudState<Entity>) => selectEntitiesMap(state),
    selectChanges,
    (
      entities: Dictionary<Entity>,
      changed: Change<Entity>[],
      { type }: { type: ChangeType }
    ) => {
      if (type)
        return changed
          .filter((c) => c.changeType === type)
          .map(
            (change) =>
              ({
                changeType: change.changeType,
                entity: entities[change.id] ?? {
                  id: change.id,
                },
              } as EntityChange<Entity>)
          );

      const map = changed.map(
        (change) =>
          ({
            changeType: change.changeType,
            entity: entities[change.id] ?? {
              id: change.id,
            },
          } as EntityChange<Entity>)
      );
      return map;
    }
  );

  const selectFilteredEntitiesChangesList = createSelector(
    selectFilteredChanges,
    (state: EntityAndCrudState<Entity>) => selectEntitiesMap(state),
    (changes, entities) =>
      changes.map((c) => {
        return {
          entity: entities[c.id] ?? { id: c.id },
          changeType: c.changeType,
        } as EntityChange<Entity>;
      })
  );

  return {
    selectEntitiesChangesList,
    selectFilteredEntitiesChangesList,
  };
}
