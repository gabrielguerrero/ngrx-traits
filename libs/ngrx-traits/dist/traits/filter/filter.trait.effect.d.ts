import { TraitEffect } from 'ngrx-traits';
import { FilterKeyedConfig, FilterSelectors } from './filter.model';
import {
  LoadEntitiesActions,
  LoadEntitiesSelectors,
} from '../load-entities/load-entities.model';
import { Type } from 'ngrx-traits';
import { ƟFilterActions } from './filter.model.internal';
import { PaginationActions } from '../pagination';
export declare function createFilterTraitEffects<Entity, F>(
  allActions: ƟFilterActions<F> &
    LoadEntitiesActions<Entity> &
    PaginationActions,
  allSelectors: FilterSelectors<Entity, F> & LoadEntitiesSelectors<Entity>,
  allConfigs: FilterKeyedConfig<Entity, F>
): Type<TraitEffect>[];
