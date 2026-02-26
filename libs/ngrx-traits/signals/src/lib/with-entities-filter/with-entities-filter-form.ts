import { FieldTree, SchemaOrSchemaFn } from '@angular/forms/signals';
import {
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  type,
} from '@ngrx/signals';
import { NamedEntityProps } from '@ngrx/signals/entities';

import { StoreSource } from '../with-feature-factory/with-feature-factory.model';
import { withForm } from '../with-form/with-form';
import { getWithEntitiesFilterKeys } from './with-entities-filter.util';
import {
  EntitiesFilterState,
  NamedEntitiesFilterComputed,
  NamedEntitiesFilterState,
} from './with-entities-local-filter.model';
import { EntitiesRemoteFilterMethods } from './with-entities-remote-filter.model';

type ExtractFilter<State, Collection extends string> = Collection extends ''
  ? State extends { entitiesFilter: infer F }
    ? F
    : Record<string, unknown>
  : State extends { [K in `${Collection}EntitiesFilter`]: infer F }
    ? F
    : Record<string, unknown>;

export function withEntitiesFilterForm<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>({
  entity,
  collection,
  filterOnChanges,
  validation,
}: {
  filterOnChanges?: boolean;
  validation?: SchemaOrSchemaFn<
    NoInfer<ExtractFilter<Input['state'], Collection>>
  >;
  entity: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  Input &
    (Collection extends ''
      ? {
          state: EntitiesFilterState<
            ExtractFilter<Input['state'], Collection>
          >;
          props: {};
          methods: {};
        }
      : {
          state: NamedEntitiesFilterState<
            Collection,
            ExtractFilter<Input['state'], Collection>
          >;
          props: {};
          methods: {};
        }),
  Collection extends ''
    ? {
        state: {};
        props: {
          [P in `entitiesFilterForm`]: FieldTree<
            ExtractFilter<Input['state'], Collection>
          >;
        };
        methods: {};
      }
    : {
        state: {};
        props: {
          [P in `${Collection}EntitiesFilterForm`]: FieldTree<
            ExtractFilter<Input['state'], Collection>
          >;
        };
        methods: {};
      }
> {
  const { filterEntitiesKey, filterKey } = getWithEntitiesFilterKeys({
    collection,
  });
  const shouldFilter = filterOnChanges ?? true;
  return signalStoreFeature(
    withForm({
      source: filterKey as any,
      validation,
      onChange: shouldFilter
        ? (form: FieldTree<any>, store: StoreSource<Input>) => {
            const filterFn = store[
              filterEntitiesKey
            ] as EntitiesRemoteFilterMethods<any, any>['filterEntities'];
            if (form().valid()) filterFn(form().value());
          }
        : null,
    } as any),
  ) as any;
}
