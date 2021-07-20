import { TraitEffect } from 'ngrx-traits';
import { Type } from 'ngrx-traits';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
} from '../load-entities/load-entities.model';
import { SortActions, SortKeyedConfig } from './sort.model';
import { PaginationActions } from '../pagination/pagination.model';
export declare function createSortTraitEffect<Entity>(
  allActions: LoadEntitiesActions<Entity> &
    SortActions<Entity> &
    PaginationActions,
  allConfigs: LoadEntitiesKeyedConfig<Entity> & SortKeyedConfig<Entity>
): Type<TraitEffect>[];
