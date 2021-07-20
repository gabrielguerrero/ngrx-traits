import { GenericActionCreator } from '../load-entities';
export declare function addReset(traitConfig?: {
  resetOn?: GenericActionCreator[];
}): import('../../../dist/model').TraitFactory<
  {},
  {
    reset: import('@ngrx/store').ActionCreator<
      string,
      () => import('@ngrx/store/src/models').TypedAction<string>
    >;
  },
  import('../../../dist/model').TraitSelectors<{}>,
  import('../../../dist/model').TraitStateMutators<{}>,
  'reset',
  {
    resetOn?: GenericActionCreator[];
  },
  import('../../../dist/model').AllTraitConfigs
>;
