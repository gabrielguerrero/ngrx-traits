import { Injectable } from '@angular/core';
import { TraitEffect } from '@ngrx-traits/core';
import { createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';
import { Type } from '@ngrx-traits/core';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
} from '../load-entities/load-entities.model';
import {
  SortEntitiesActions,
  SortEntitiesKeyedConfig,
} from './sort-entities.model';
import { EntitiesPaginationActions } from '../entities-pagination/entities-pagination.model';

export function createSortTraitEffect<Entity>(
  allActions: LoadEntitiesActions<Entity> &
    SortEntitiesActions<Entity> &
    EntitiesPaginationActions,
  allConfigs: LoadEntitiesKeyedConfig<Entity> & SortEntitiesKeyedConfig<Entity>
): Type<TraitEffect>[] {
  const { remote } = allConfigs.sort!;

  @Injectable()
  class SortEffect extends TraitEffect {
    remoteSort$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.sortEntities, allActions.resetEntitiesSort),
        concatMap(() =>
          allActions.loadEntitiesFirstPage
            ? [
                allActions.clearEntitiesPagesCache(),
                allActions.loadEntitiesFirstPage(),
              ]
            : [allActions.loadEntities()]
        )
      );
    });
  }
  return remote ? [SortEffect] : [];
}
