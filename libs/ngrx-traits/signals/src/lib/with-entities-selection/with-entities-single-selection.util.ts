import { computed, Signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { concatMap, first } from 'rxjs';

import { capitalize } from '../util';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { QueryMapper } from '../with-sync-to-route-query-params/with-sync-to-route-query-params.util';
import {
  EntitiesSingleSelectionMethods,
  EntitiesSingleSelectionState,
} from './with-entities-single-selection.model';

export function getEntitiesSingleSelectionKeys(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    selectedIdKey: collection ? `${config.collection}IdSelected` : 'idSelected',
    selectedEntityKey: collection
      ? `${config.collection}EntitySelected`
      : 'entitySelected',
    selectEntityKey: collection
      ? `select${capitalizedProp}Entity`
      : 'selectEntity',
    deselectEntityKey: collection
      ? `deselect${capitalizedProp}Entity`
      : 'deselectEntity',
    toggleEntityKey: collection
      ? `toggle${capitalizedProp}Entity`
      : 'toggleEntity',
  };
}

export function getQueryMapperForSingleSelection(config?: {
  collection?: string;
}): QueryMapper<{
  selectedId: string | number | undefined;
}> {
  const { selectedIdKey, selectEntityKey } =
    getEntitiesSingleSelectionKeys(config);
  const { loadingKey, loadedKey } = getWithCallStatusKeys({
    prop: config?.collection,
  });
  return {
    queryParamsToState: (query, store) => {
      const selectedId = query.selectedId;
      if (selectedId) {
        const selectEntity = store[
          selectEntityKey
        ] as EntitiesSingleSelectionMethods['selectEntity'];

        const loading = store[loadingKey] as Signal<boolean>;
        const loaded = store[loadedKey] as Signal<boolean>;
        const loaded$ = toObservable(loaded);

        toObservable(loading)
          .pipe(
            first((v) => v),
            concatMap(() => loaded$.pipe(first((v) => v))),
            takeUntilDestroyed(),
          )
          .subscribe(() => {
            selectEntity({
              id: selectedId,
            });
          });
      }
    },
    stateToQueryParams: (store) => {
      const selectedId = store[selectedIdKey] as Signal<
        EntitiesSingleSelectionState['idSelected']
      >;
      return selectedId
        ? computed(() => ({
            selectedId: selectedId(),
          }))
        : undefined;
    },
  };
}
