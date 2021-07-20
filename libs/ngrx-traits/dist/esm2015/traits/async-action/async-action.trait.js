import { createAction, createReducer, on } from '@ngrx/store';
import { createTraitFactory } from 'ngrx-traits';
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
export function addAsyncAction({
  name,
  actionProps,
  actionSuccessProps,
  actionFailProps,
}) {
  const nameAsSentence = camelCaseToSentence(name);
  let internalActions;
  return createTraitFactory({
    key: name + '-call',
    config: {
      name,
      actionProps,
      actionSuccessProps,
      actionFailProps,
    },
    actions: ({ actionsGroupKey }) => {
      internalActions = {
        request: actionProps
          ? createAction(`${actionsGroupKey} ${nameAsSentence}`, actionProps)
          : createAction(`${actionsGroupKey} ${nameAsSentence}`),
        requestSuccess: actionSuccessProps
          ? createAction(
              `${actionsGroupKey} ${nameAsSentence} Success`,
              actionSuccessProps
            )
          : createAction(`${actionsGroupKey} ${nameAsSentence} Success`),
        requestFail: actionFailProps
          ? createAction(
              `${actionsGroupKey} ${nameAsSentence} Failure`,
              actionFailProps
            )
          : createAction(`${actionsGroupKey} ${nameAsSentence} Failure`),
      };
      if (name) {
        return {
          [`${name}`]: internalActions.request,
          [`${name}Success`]: internalActions.requestSuccess,
          [`${name}Fail`]: internalActions.requestFail,
        };
      }
      return internalActions;
    },
    selectors: () => {
      function isLoadingEntity(state) {
        return state[`${name}Status`] === 'loading';
      }
      function isSuccessEntity(state) {
        return state[`${name}Status`] === 'success';
      }
      function isFailEntity(state) {
        return state[`${name}Status`] === 'fail';
      }
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      return {
        [`isLoading${capitalizedName}`]: isLoadingEntity,
        [`isSuccess${capitalizedName}`]: isSuccessEntity,
        [`isFail${capitalizedName}`]: isFailEntity,
      };
    },
    initialState: ({ previousInitialState }) => previousInitialState,
    reducer: ({ initialState }) => {
      return createReducer(
        initialState,
        on(internalActions.request, (state) =>
          Object.assign(Object.assign({}, state), {
            [`${name}Status`]: 'loading',
          })
        ),
        on(internalActions.requestFail, (state) =>
          Object.assign(Object.assign({}, state), { [`${name}Status`]: 'fail' })
        ),
        on(internalActions.requestSuccess, (state) =>
          Object.assign(Object.assign({}, state), {
            [`${name}Status`]: 'success',
          })
        )
      );
    },
  });
}
function camelCaseToSentence(text) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMtYWN0aW9uLnRyYWl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdHJhaXRzL3NyYy9hc3luYy1hY3Rpb24vYXN5bmMtYWN0aW9uLnRyYWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUU5RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFZakQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9DRztBQUNILE1BQU0sVUFBVSxjQUFjLENBSzVCLEVBQ0EsSUFBSSxFQUNKLFdBQVcsRUFDWCxrQkFBa0IsRUFDbEIsZUFBZSxHQU1oQjtJQUNDLE1BQU0sY0FBYyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWpELElBQUksZUFLSCxDQUFDO0lBQ0YsT0FBTyxrQkFBa0IsQ0FBQztRQUN4QixHQUFHLEVBQUUsSUFBSSxHQUFHLE9BQU87UUFDbkIsTUFBTSxFQUFFO1lBQ04sSUFBSTtZQUNKLFdBQVc7WUFDWCxrQkFBa0I7WUFDbEIsZUFBZTtTQUNoQjtRQUNELE9BQU8sRUFBRSxDQUFDLEVBQ1IsZUFBZSxHQUNXLEVBSzFCLEVBQUU7WUFDRixlQUFlLEdBQUc7Z0JBQ2hCLE9BQU8sRUFBRSxDQUFDLFdBQVc7b0JBQ25CLENBQUMsQ0FBQyxZQUFZLENBQ1YsR0FBRyxlQUFlLElBQUksY0FBYyxFQUFFLEVBQ3RDLFdBQWtCLENBQ25CO29CQUNILENBQUMsQ0FBQyxZQUFZLENBQ1YsR0FBRyxlQUFlLElBQUksY0FBYyxFQUFFLENBQ3ZDLENBQTRDO2dCQUNqRCxjQUFjLEVBQUUsQ0FBQyxrQkFBa0I7b0JBQ2pDLENBQUMsQ0FBQyxZQUFZLENBQ1YsR0FBRyxlQUFlLElBQUksY0FBYyxVQUFVLEVBQzlDLGtCQUF5QixDQUMxQjtvQkFDSCxDQUFDLENB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QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUFjdGlvbiwgY3JlYXRlUmVkdWNlciwgb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBBY3Rpb25DcmVhdG9yUHJvcHMgfSBmcm9tICdAbmdyeC9zdG9yZS9zcmMvbW9kZWxzJztcbmltcG9ydCB7IGNyZWF0ZVRyYWl0RmFjdG9yeSB9IGZyb20gJ25ncngtdHJhaXRzJztcbmltcG9ydCB7XG4gIEFjdGlvbkNyZWF0b3JXaXRoT3B0aW9uYWxQcm9wcyxcbiAgQXN5bmNBY3Rpb25BY3Rpb25zLFxuICBBc3luY0FjdGlvblNlbGVjdG9ycyxcbiAgQXN5bmNBY3Rpb25TdGF0ZSxcbn0gZnJvbSAnLi9hc3luYy1hY3Rpb24ubW9kZWwnO1xuaW1wb3J0IHtcbiAgVHJhaXRBY3Rpb25zRmFjdG9yeUNvbmZpZyxcbiAgVHJhaXRJbml0aWFsU3RhdGVGYWN0b3J5Q29uZmlnLFxufSBmcm9tICduZ3J4LXRyYWl0cyc7XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB0eXBpY2FsIG5ncnggY29kZSBuZWVkIHRvIG1ha2UgYSBhc3luYyBhY3Rpb24gd2l0aFxuICogYSByZXF1ZXN0LCBzdWNjZXNzIGFuZCBmYWlsdXJlIGFjdGlvbnMsIHBsdXMgYSBzdGF0dXMgcHJvcGVydHkgdG8gdHJhY2sgaXRzIHByb2dyZXNzXG4gKiBhbmQgc2VsZWN0b3JzIHRvIHF1ZXJ5IHRoZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSBDb25maWcgb2JqZWN0IGZvciB0aGUgdHJhaXQgZmFjdG9yeVxuICogQHBhcmFtIG9wdGlvbnMubmFtZSAtIE5hbWUgb2YgdGhlIG1haW4gcmVxdWVzdCBhY3Rpb24sIHNob3VsZCBiZSBpbiBjYW1lbCBjYXNlXG4gKiBAcGFyYW0gb3B0aW9ucy5hY3Rpb25Qcm9wcyAtIE9wdGlvbmFsIHBhcmFtIGZvciB0aGUgbWFpbiByZXF1ZXN0IGFjdGlvbiwgdXNlIHRoZSBwcm9wcygpXG4gKiBmdW5jdGlvbiBmb3IgaXRzIHZhbHVlLCBpZiBub3QgcHJlc2VudCBhY3Rpb24gd2lsbCBoYXZlIG5vIHBhcmFtcyxcbiAqIEBwYXJhbSBvcHRpb25zLmFjdGlvblN1Y2Nlc3NQcm9wcyAtIE9wdGlvbmFsIHBhcmFtIGZvciB0aGUgcmVxdWVzdCBzdWNjZXNzIGFjdGlvbixcbiAqIHVzZSB0aGUgcHJvcHMoKSBmdW5jdGlvbiBmb3IgaXRzIHZhbHVlLCBpZiBub3QgcHJlc2VudCBhY3Rpb24gc3VjY2VzcyB3aWxsIGhhdmUgbm8gcGFyYW1zXG4gKiBAcGFyYW0gb3B0aW9ucy5hY3Rpb25GYWlsUHJvcHMgLSBPcHRpb25hbCBwYXJhbSBmb3IgdGhlIHJlcXVlc3QgZmFpbCBhY3Rpb24sXG4gKiB1c2UgdGhlIHByb3BzKCkgZnVuY3Rpb24gZm9yIGl0cyB2YWx1ZSwgaWYgbm90IHByZXNlbnQgYWN0aW9uIGZhaWwgd2lsbCBoYXZlIG5vIHBhcmFtc1xuICogQHJldHVybnMgdGhlIHRyYWl0IGZhY3RvcnlcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gVGhlIGZvbGxvd2luZyB0cmFpdCBjb25maWdcbiAqIGNvbnN0IHRyYWl0cyA9IGNyZWF0ZUVudGl0eUZlYXR1cmVGYWN0b3J5KFxuICogYWRkQXN5bmNBY3Rpb24oe1xuICogICAgICAgIG5hbWU6ICdjcmVhdGVDbGllbnQnLFxuICogICAgICAgIGFjdGlvblByb3BzOiBwcm9wczx7IG5hbWU6IHN0cmluZyB9PigpLFxuICogICAgICAgIGFjdGlvblN1Y2Nlc3NQcm9wczogcHJvcHM8eyBpZDogc3RyaW5nIH0+KCksXG4gKiAgICAgIH0pLFxuICogKSh7XG4gKiAgICAgIGFjdGlvbnNHcm91cEtleTogJ0NsaWVudCcsXG4gKiAgICAgIGZlYXR1cmVTZWxlY3RvcjogY3JlYXRlRmVhdHVyZVNlbGVjdG9yPEFzeW5jQWN0aW9uU3RhdGU8J2NyZWF0ZUNsaWVudCc+PihcbiAqICAgICAgICAnY2xpZW50JyxcbiAqICAgICAgKSxcbiAqICAgIH0pO1xuICogLy8gd2lsbCBnZW5lcmF0ZSB0aGUgYWN0aW9ucyBhbmQgc2VsZWN0b3JzXG4gKiB0cmFpdHMuYWN0aW9ucy5jcmVhdGVDbGllbnQoe25hbWU6J1BlZHJvJ30pXG4gKiB0cmFpdHMuYWN0aW9ucy5jcmVhdGVDbGllbnRTdWNjZXNzKHtpZDonMTIzJ30pXG4gKiB0cmFpdHMuYWN0aW9ucy5jcmVhdGVDbGllbnRGYWlsKCk7XG4gKiB0cmFpdHMuc2VsZWN0b3JzLmlzTG9hZGluZ0NyZWF0ZUNsaWVudFxuICogdHJhaXRzLnNlbGVjdG9ycy5pc1N1Y2Nlc3NDcmVhdGVDbGllbnRcbiAqIHRyYWl0cy5zZWxlY3RvcnMuaXNGYWlsQ3JlYXRlQ2xpZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRBc3luY0FjdGlvbjxcbiAgSiBleHRlbmRzIHN0cmluZyxcbiAgUmVxdWVzdCBleHRlbmRzIG9iamVjdCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbiAgUmVzcG9uc2UgZXh0ZW5kcyBvYmplY3QgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQsXG4gIEZhaWx1cmUgZXh0ZW5kcyBvYmplY3QgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQsXG4+KHtcbiAgbmFtZSxcbiAgYWN0aW9uUHJvcHMsXG4gIGFjdGlvblN1Y2Nlc3NQcm9wcyxcbiAgYWN0aW9uRmFpbFByb3BzLFxufToge1xuICBuYW1lOiBKO1xuICBhY3Rpb25Qcm9wcz86IEFjdGlvbkNyZWF0b3JQcm9wczxSZXF1ZXN0PjtcbiAgYWN0aW9uU3VjY2Vzc1Byb3BzPzogQWN0aW9uQ3JlYXRvclByb3BzPFJlc3BvbnNlPjtcbiAgYWN0aW9uRmFpbFByb3BzPzogQWN0aW9uQ3JlYXRvclByb3BzPEZhaWx1cmU+O1xufSkge1xuICBjb25zdCBuYW1lQXNTZW50ZW5jZSA9IGNhbWVsQ2FzZVRvU2VudGVuY2UobmFtZSk7XG5cbiAgbGV0IGludGVybmFsQWN0aW9uczogQXN5bmNBY3Rpb25BY3Rpb25zPFxuICAgIFJlcXVlc3QsXG4gICAgUmVzcG9uc2UsXG4gICAgRmFpbHVyZSxcbiAgICAncmVxdWVzdCdcbiAgPjtcbiAgcmV0dXJuIGNyZWF0ZVRyYWl0RmFjdG9yeSh7XG4gICAga2V5OiBuYW1lICsgJy1jYWxsJyxcbiAgICBjb25maWc6IHtcbiAgICAgIG5hbWUsXG4gICAgICBhY3Rpb25Qcm9wcyxcbiAgICAgIGFjdGlvblN1Y2Nlc3NQcm9wcyxcbiAgICAgIGFjdGlvbkZhaWxQcm9wcyxcbiAgICB9LFxuICAgIGFjdGlvbnM6ICh7XG4gICAgICBhY3Rpb25zR3JvdXBLZXksXG4gICAgfTogVHJhaXRBY3Rpb25zRmFjdG9yeUNvbmZpZyk6IEFzeW5jQWN0aW9uQWN0aW9uczxcbiAgICAgIFJlcXVlc3QsXG4gICAgICBSZXNwb25zZSxcbiAgICAgIEZhaWx1cmUsXG4gICAgICBKXG4gICAgPiA9PiB7XG4gICAgICBpbnRlcm5hbEFjdGlvbnMgPSB7XG4gICAgICAgIHJlcXVlc3Q6IChhY3Rpb25Qcm9wc1xuICAgICAgICAgID8gY3JlYXRlQWN0aW9uKFxuICAgICAgICAgICAgICBgJHthY3Rpb25zR3JvdXBLZXl9ICR7bmFtZUFzU2VudGVuY2V9YCxcbiAgICAgICAgICAgICAgYWN0aW9uUHJvcHMgYXMgYW55LFxuICAgICAgICAgICAgKVxuICAgICAgICAgIDogY3JlYXRlQWN0aW9uKFxuICAgICAgICAgICAgICBgJHthY3Rpb25zR3JvdXBLZXl9ICR7bmFtZUFzU2VudGVuY2V9YCxcbiAgICAgICAgICAgICkpIGFzIEFjdGlvbkNyZWF0b3JXaXRoT3B0aW9uYWxQcm9wczxSZXF1ZXN0PixcbiAgICAgICAgcmVxdWVzdFN1Y2Nlc3M6IChhY3Rpb25TdWNjZXNzUHJvcHNcbiAgICAgICAgICA/IGNyZWF0ZUFjdGlvbihcbiAgICAgICAgICAgICAgYCR7YWN0aW9uc0dyb3VwS2V5fSAke25hbWVBc1NlbnRlbmNlfSBTdWNjZXNzYCxcbiAgICAgICAgICAgICAgYWN0aW9uU3VjY2Vzc1Byb3BzIGFzIGFueSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICA6IGNyZWF0ZUFjdGlvbihcbiAgICAgICAgICAgICAgYCR7YWN0aW9uc0dyb3VwS2V5fSAke25hbWVBc1NlbnRlbmNlfSBTdWNjZXNzYCxcbiAgICAgICAgICAgICkpIGFzIEFjdGlvbkNyZWF0b3JXaXRoT3B0aW9uYWxQcm9wczxSZXNwb25zZT4sXG4gICAgICAgIHJlcXVlc3RGYWlsOiAoYWN0aW9uRmFpbFByb3BzXG4gICAgICAgICAgPyBjcmVhdGVBY3Rpb24oXG4gICAgICAgICAgICAgIGAke2FjdGlvbnNHcm91cEtleX0gJHtuYW1lQXNTZW50ZW5jZX0gRmFpbHVyZWAsXG4gICAgICAgICAgICAgIGFjdGlvbkZhaWxQcm9wcyBhcyBhbnksXG4gICAgICAgICAgICApXG4gICAgICAgICAgOiBjcmVhdGVBY3Rpb24oXG4gICAgICAgICAgICAgIGAke2FjdGlvbnNHcm91cEtleX0gJHtuYW1lQXNTZW50ZW5jZX0gRmFpbHVyZWAsXG4gICAgICAgICAgICApKSBhcyBBY3Rpb25DcmVhdG9yV2l0aE9wdGlvbmFsUHJvcHM8RmFpbHVyZT4sXG4gICAgICB9O1xuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBbYCR7bmFtZX1gXTogaW50ZXJuYWxBY3Rpb25zLnJlcXVlc3QsXG4gICAgICAgICAgW2Ake25hbWV9U3VjY2Vzc2BdOiBpbnRlcm5hbEFjdGlvbnMucmVxdWVzdFN1Y2Nlc3MsXG4gICAgICAgICAgW2Ake25hbWV9RmFpbGBdOiBpbnRlcm5hbEFjdGlvbnMucmVxdWVzdEZhaWwsXG4gICAgICAgIH0gYXMgQXN5bmNBY3Rpb25BY3Rpb25zPFJlcXVlc3QsIFJlc3BvbnNlLCBGYWlsdXJlLCBKPjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbnRlcm5hbEFjdGlvbnM7XG4gICAgfSxcbiAgICBzZWxlY3RvcnM6ICgpID0+IHtcbiAgICAgIGZ1bmN0aW9uIGlzTG9hZGluZ0VudGl0eTxTIGV4dGVuZHMgQXN5bmNBY3Rpb25TdGF0ZTxKPj4oc3RhdGU6IFMpIHtcbiAgICAgICAgcmV0dXJuIChzdGF0ZSBhcyBhbnkpW2Ake25hbWV9U3RhdHVzYF0gPT09ICdsb2FkaW5nJztcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGlzU3VjY2Vzc0VudGl0eTxTIGV4dGVuZHMgQXN5bmNBY3Rpb25TdGF0ZTxKPj4oc3RhdGU6IFMpIHtcbiAgICAgICAgcmV0dXJuIChzdGF0ZSBhcyBhbnkpW2Ake25hbWV9U3RhdHVzYF0gPT09ICdzdWNjZXNzJztcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGlzRmFpbEVudGl0eTxTIGV4dGVuZHMgQXN5bmNBY3Rpb25TdGF0ZTxKPj4oc3RhdGU6IFMpIHtcbiAgICAgICAgcmV0dXJuIChzdGF0ZSBhcyBhbnkpW2Ake25hbWV9U3RhdHVzYF0gPT09ICdmYWlsJztcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNhcGl0YWxpemVkTmFtZSA9IG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgW2Bpc0xvYWRpbmcke2NhcGl0YWxpemVkTmFtZX1gXTogaXNMb2FkaW5nRW50aXR5LFxuICAgICAgICBbYGlzU3VjY2VzcyR7Y2FwaXRhbGl6ZWROYW1lfWBdOiBpc1N1Y2Nlc3NFbnRpdHksXG4gICAgICAgIFtgaXNGYWlsJHtjYXBpdGFsaXplZE5hbWV9YF06IGlzRmFpbEVudGl0eSxcbiAgICAgIH0gYXMgQXN5bmNBY3Rpb25TZWxlY3RvcnM8SiwgQXN5bmNBY3Rpb25TdGF0ZTxKPj47XG4gICAgfSxcbiAgICBpbml0aWFsU3RhdGU6ICh7IHByZXZpb3VzSW5pdGlhbFN0YXRlIH06IFRyYWl0SW5pdGlhbFN0YXRlRmFjdG9yeUNvbmZpZykgPT5cbiAgICAgIHByZXZpb3VzSW5pdGlhbFN0YXRlIGFzIEFzeW5jQWN0aW9uU3RhdGU8Sj4sXG4gICAgcmVkdWNlcjogKHsgaW5pdGlhbFN0YXRlIH0pID0+IHtcbiAgICAgIHJldHVybiBjcmVhdGVSZWR1Y2VyKFxuICAgICAgICBpbml0aWFsU3RhdGUsXG4gICAgICAgIG9uKFxuICAgICAgICAgIGludGVybmFsQWN0aW9ucy5yZXF1ZXN0LFxuICAgICAgICAgIChzdGF0ZSkgPT5cbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgICBbYCR7bmFtZX1TdGF0dXNgXTogJ2xvYWRpbmcnLFxuICAgICAgICAgICAgfSBhcyBBc3luY0FjdGlvblN0YXRlPEo+KSxcbiAgICAgICAgKSxcbiAgICAgICAgb24oXG4gICAgICAgICAgaW50ZXJuYWxBY3Rpb25zLnJlcXVlc3RGYWlsLFxuICAgICAgICAgIChzdGF0ZSkgPT5cbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgICBbYCR7bmFtZX1TdGF0dXNgXTogJ2ZhaWwnLFxuICAgICAgICAgICAgfSBhcyBBc3luY0FjdGlvblN0YXRlPEo+KSxcbiAgICAgICAgKSxcbiAgICAgICAgb24oXG4gICAgICAgICAgaW50ZXJuYWxBY3Rpb25zLnJlcXVlc3RTdWNjZXNzLFxuICAgICAgICAgIChzdGF0ZSkgPT5cbiAgICAgICAgICAgICh7XG4gICAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgICBbYCR7bmFtZX1TdGF0dXNgXTogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgfSBhcyBBc3luY0FjdGlvblN0YXRlPEo+KSxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbWVsQ2FzZVRvU2VudGVuY2UodGV4dDogc3RyaW5nKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHRleHQucmVwbGFjZSgvKFtBLVpdKS9nLCAnICQxJyk7XG4gIHJldHVybiByZXN1bHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyByZXN1bHQuc2xpY2UoMSk7XG59XG4iXX0=
