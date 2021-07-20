import { ActionCreatorProps } from '@ngrx/store/src/models';
import { ActionCreatorWithOptionalProps } from './async-action.model';
/**
 * Generates the typical ngrx code need to make a async action with
 * a request, success and failure actions, plus a status property to track its progress
 * and selectors to query the status.
 *
 * @param options - Config object for the trait factory
 * @param options.name - Name of the main request action, should be in camel case
 * @param options.actionProps - Optional param for the main request action, use the props()
 * function for its value, if not present action will have no params,
 * @param options.actionSuccessProps - Optional param for the request success action,
 * use the props() function for its value, if not present action success will have no params
 * @param options.actionFailProps - Optional param for the request fail action,
 * use the props() function for its value, if not present action fail will have no params
 * @returns the trait factory
 *
 * @example
 * // The following trait config
 * const traits = createEntityFeatureFactory(
 * addAsyncAction({
 *        name: 'createClient',
 *        actionProps: props<{ name: string }>(),
 *        actionSuccessProps: props<{ id: string }>(),
 *      }),
 * )({
 *      actionsGroupKey: 'Client',
 *      featureSelector: createFeatureSelector<AsyncActionState<'createClient'>>(
 *        'client',
 *      ),
 *    });
 * // will generate the actions and selectors
 * traits.actions.createClient({name:'Pedro'})
 * traits.actions.createClientSuccess({id:'123'})
 * traits.actions.createClientFail();
 * traits.selectors.isLoadingCreateClient
 * traits.selectors.isSuccessCreateClient
 * traits.selectors.isFailCreateClient
 */
export declare function addAsyncAction<
  J extends string,
  Request extends object | undefined = undefined,
  Response extends object | undefined = undefined,
  Failure extends object | undefined = undefined
>({
  name,
  actionProps,
  actionSuccessProps,
  actionFailProps,
}: {
  name: J;
  actionProps?: ActionCreatorProps<Request>;
  actionSuccessProps?: ActionCreatorProps<Response>;
  actionFailProps?: ActionCreatorProps<Failure>;
}): import('../../../dist/model').TraitFactory<
  import('../../../dist/model').PrefixProps<import('..').StatusState, J>,
  import('../../../dist/model').PrefixProps<
    {
      '': ActionCreatorWithOptionalProps<Request>;
      Success: ActionCreatorWithOptionalProps<Response>;
      Fail: ActionCreatorWithOptionalProps<Failure>;
    },
    J
  >,
  import('../../../dist/model').PostfixProps<
    {
      isLoading: (
        state: import('../../../dist/model').PrefixProps<
          import('..').StatusState,
          J
        >
      ) => boolean;
      isSuccess: (
        state: import('../../../dist/model').PrefixProps<
          import('..').StatusState,
          J
        >
      ) => boolean;
      isFail: (
        state: import('../../../dist/model').PrefixProps<
          import('..').StatusState,
          J
        >
      ) => boolean;
    },
    J
  >,
  import('../../../dist/model').TraitStateMutators<
    import('../../../dist/model').PrefixProps<import('..').StatusState, J>
  >,
  string,
  {
    name: J;
    actionProps: ActionCreatorProps<Request>;
    actionSuccessProps: ActionCreatorProps<Response>;
    actionFailProps: ActionCreatorProps<Failure>;
  },
  import('../../../dist/model').AllTraitConfigs
>;
