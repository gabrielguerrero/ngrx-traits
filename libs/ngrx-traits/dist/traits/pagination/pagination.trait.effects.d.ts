import { TraitEffect } from 'ngrx-traits';
import { FilterActions } from '../filter/filter.model';
import { LoadEntitiesActions, LoadEntitiesSelectors } from '../load-entities';
import { CrudActions } from '../crud/crud.model';
import { PaginationSelectors } from './pagination.model';
import { Type } from 'ngrx-traits';
import { ƟPaginationActions } from './pagination.model.internal';
export declare function createPaginationTraitEffects<Entity>(
  allActions: ƟPaginationActions &
    FilterActions<Entity> &
    LoadEntitiesActions<Entity> &
    CrudActions<Entity>,
  allSelectors: LoadEntitiesSelectors<Entity> & PaginationSelectors<Entity>
): Type<TraitEffect>[];
