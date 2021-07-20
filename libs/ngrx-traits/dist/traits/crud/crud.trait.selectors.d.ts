import { CrudSelectors } from './crud.model';
import { LoadEntitiesSelectors } from '../load-entities/load-entities.model';
export declare function createCrudTraitSelectors<Entity>(
  previousSelectors: LoadEntitiesSelectors<Entity>
): CrudSelectors<Entity>;
