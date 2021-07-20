import { CrudKeyedConfig, CrudMutators } from '../crud/crud.model';
import { LoadEntitiesKeyedConfig } from '../load-entities/load-entities.model';
export declare function createCrudTraitMutators<Entity>(
  allConfigs: CrudKeyedConfig & LoadEntitiesKeyedConfig<Entity>
): CrudMutators<Entity>;
