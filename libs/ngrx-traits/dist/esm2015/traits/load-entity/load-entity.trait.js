import { createTraitFactory } from 'ngrx-traits';
import { createReducer, on } from '@ngrx/store';
import { addAsyncAction } from '../async-action/async-action.trait';
/**
 * Generates ngrx code needed to load and entity and store it in a state
 * @param entityName - Entity name, should be in camel case
 * @param options.actionProps - Optional param for the main request action,
 * use the props() function for its value, if not present action will have no params,
 * @param options.actionSuccessProps - Optional param for the request success
 * action, use the props() function for its value, if not present action success will have no params
 * @param options.actionFailProps - Optional param for the request fail action,
 * use the props() function for its value, if not present action fail will have no params
 * @returns the trait factory
 *
 * @example
 * const traits = createEntityFeatureFactory(
 * ...addLoadEntity({
 *        entityName: 'client',
 *        requestProps: props<{ id: string }>(),
 *        responseProps: props<{ client: Client }>(),
 *      }),
 * )({
 *      actionsGroupKey: 'Client',
 *      featureSelector: createFeatureSelector<
 *        LoadEntityState<Client, 'client'>
 *        >('client'),
 *    });
 *
 * // will generate
 * traits.actions.loadClient({id:123});
 * traits.actions.loadClientSuccess({client: {id: '123', name: 'gabs'}});
 * traits.actions.loadClientFail();
 * traits.selectors.selectClient
 * traits.selectors.isLoadingLoadClient
 * traits.selectors.isSuccessLoadClient
 * traits.selectors.isFailLoadClient
 */
export function addLoadEntity({
  entityName,
  actionProps,
  actionSuccessProps,
  actionFailProps,
}) {
  const capitalizedName =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);
  return [
    addAsyncAction({
      name: 'load' + capitalizedName,
      actionProps,
      actionSuccessProps,
      actionFailProps,
    }),
    createTraitFactory({
      key: `load${capitalizedName}`,
      config: { entityName, actionProps, actionSuccessProps, actionFailProps },
      selectors: () => {
        function selectEntity(state) {
          return state[`${entityName}`];
        }
        return {
          [`select${capitalizedName}`]: selectEntity,
        };
      },
      initialState: ({ previousInitialState }) => previousInitialState,
      reducer: ({ initialState, allActions }) => {
        return createReducer(
          initialState,
          on(allActions[`load${capitalizedName}Success`], (state, action) =>
            Object.assign(Object.assign({}, state), {
              [entityName]: action[entityName],
            })
          )
        );
      },
    }),
  ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZC1lbnRpdHkudHJhaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90cmFpdHMvc3JjL2xvYWQtZW50aXR5L2xvYWQtZW50aXR5LnRyYWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNqRCxPQUFPLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVoRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFNcEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNILE1BQU0sVUFBVSxhQUFhLENBTzNCLEVBQ0EsVUFBVSxFQUNWLFdBQVcsRUFDWCxrQkFBa0IsRUFDbEIsZUFBZSxHQU1oQjtJQUNDLE1BQU0sZUFBZSxHQUNuQixVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFJM0QsT0FBTztRQUNMLGNBQWMsQ0FBZ0M7WUFDNUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLGVBQWUsQ0FBTTtZQUNyQyxXQUFXO1lBQ1gsa0JBQWtCO1lBQ2xCLGVBQWU7U0FDaEIsQ0FBQztRQUNGLGtCQUFrQixDQUFDO1lBQ2pCLEdBQUcsRUFBRSxPQUFPLGVBQWUsRUFBRTtZQUM3QixNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFFLGVBQWUsRUFBRTtZQUN4RSxTQUFTLEVBQUUsR0FBRyxFQUFFO2dCQUNkLFNBQVMsWUFBWSxDQUFDLEtBQVk7b0JBQ2hDLE9BQVEsS0FBYSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQVcsQ0FBQztnQkFDbkQsQ0FBQztnQkFFRCxPQUFPO29CQUNMLENBQUMsU0FBUyxlQUFlLEVBQUUsQ0FBQyxFQUFFLFlBQVk7aUJBQ1QsQ0FBQztZQUN0QyxDQUFDO1lBQ0QsWUFBWSxFQUFFLENBQUMsRUFDYixvQkFBb0IsR0FDVyxFQUFFLEVBQUUsQ0FBQyxvQkFBNkI7WUFDbkUsT0FBTyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRTtnQkFDeEMsT0FBTyxhQUFhLENBQ2xCLFlBQVksRUFDWixFQUFFLENBQ0MsVUFBa0IsQ0FBQyxPQUFPLGVBQWUsU0FBUyxDQUFDLEVBQ3BELENBQUMsS0FBVSxFQUFFLE1BQVcsRUFBRSxFQUFFLENBQUMsaUNBQ3hCLEtBQUssS0FDUixDQUFDLFVBQVUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFDaEMsQ0FDSCxDQUNGLENBQUM7WUFDSixDQUFDO1NBQ0YsQ0FBQztLQUNNLENBQUM7QUFDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWN0aW9uQ3JlYXRvclByb3BzIH0gZnJvbSAnQG5ncngvc3RvcmUvc3JjL21vZGVscyc7XG5pbXBvcnQgeyBjcmVhdGVUcmFpdEZhY3RvcnkgfSBmcm9tICduZ3J4LXRyYWl0cyc7XG5pbXBvcnQgeyBjcmVhdGVSZWR1Y2VyLCBvbiB9IGZyb20gJ0BuZ3J4L3N0b3JlJztcblxuaW1wb3J0IHsgYWRkQXN5bmNBY3Rpb24gfSBmcm9tICcuLi9hc3luYy1hY3Rpb24vYXN5bmMtYWN0aW9uLnRyYWl0JztcbmltcG9ydCB7IExvYWRFbnRpdHlTZWxlY3RvcnMsIExvYWRFbnRpdHlTdGF0ZSB9IGZyb20gJy4vbG9hZC1lbnRpdHkubW9kZWwnO1xuaW1wb3J0IHsgVHJhaXRJbml0aWFsU3RhdGVGYWN0b3J5Q29uZmlnIH0gZnJvbSAnbmdyeC10cmFpdHMnO1xuXG50eXBlIFJlY29yZEVudGl0eTxUPiA9IFQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBpbmZlciBKPiA/IEogOiBuZXZlcjtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgbmdyeCBjb2RlIG5lZWRlZCB0byBsb2FkIGFuZCBlbnRpdHkgYW5kIHN0b3JlIGl0IGluIGEgc3RhdGVcbiAqIEBwYXJhbSBlbnRpdHlOYW1lIC0gRW50aXR5IG5hbWUsIHNob3VsZCBiZSBpbiBjYW1lbCBjYXNlXG4gKiBAcGFyYW0gb3B0aW9ucy5hY3Rpb25Qcm9wcyAtIE9wdGlvbmFsIHBhcmFtIGZvciB0aGUgbWFpbiByZXF1ZXN0IGFjdGlvbixcbiAqIHVzZSB0aGUgcHJvcHMoKSBmdW5jdGlvbiBmb3IgaXRzIHZhbHVlLCBpZiBub3QgcHJlc2VudCBhY3Rpb24gd2lsbCBoYXZlIG5vIHBhcmFtcyxcbiAqIEBwYXJhbSBvcHRpb25zLmFjdGlvblN1Y2Nlc3NQcm9wcyAtIE9wdGlvbmFsIHBhcmFtIGZvciB0aGUgcmVxdWVzdCBzdWNjZXNzXG4gKiBhY3Rpb24sIHVzZSB0aGUgcHJvcHMoKSBmdW5jdGlvbiBmb3IgaXRzIHZhbHVlLCBpZiBub3QgcHJlc2VudCBhY3Rpb24gc3VjY2VzcyB3aWxsIGhhdmUgbm8gcGFyYW1zXG4gKiBAcGFyYW0gb3B0aW9ucy5hY3Rpb25GYWlsUHJvcHMgLSBPcHRpb25hbCBwYXJhbSBmb3IgdGhlIHJlcXVlc3QgZmFpbCBhY3Rpb24sXG4gKiB1c2UgdGhlIHByb3BzKCkgZnVuY3Rpb24gZm9yIGl0cyB2YWx1ZSwgaWYgbm90IHByZXNlbnQgYWN0aW9uIGZhaWwgd2lsbCBoYXZlIG5vIHBhcmFtc1xuICogQHJldHVybnMgdGhlIHRyYWl0IGZhY3RvcnlcbiAqXG4gKiBAZXhhbXBsZVxuICogY29uc3QgdHJhaXRzID0gY3JlYXRlRW50aXR5RmVhdHVyZUZhY3RvcnkoXG4gKiAuLi5hZGRMb2FkRW50aXR5KHtcbiAqICAgICAgICBlbnRpdHlOYW1lOiAnY2xpZW50JyxcbiAqICAgICAgICByZXF1ZXN0UHJvcHM6IHByb3BzPHsgaWQ6IHN0cmluZyB9PigpLFxuICogICAgICAgIHJlc3BvbnNlUHJvcHM6IHByb3BzPHsgY2xpZW50OiBDbGllbnQgfT4oKSxcbiAqICAgICAgfSksXG4gKiApKHtcbiAqICAgICAgYWN0aW9uc0dyb3VwS2V5OiAnQ2xpZW50JyxcbiAqICAgICAgZmVhdHVyZVNlbGVjdG9yOiBjcmVhdGVGZWF0dXJlU2VsZWN0b3I8XG4gKiAgICAgICAgTG9hZEVudGl0eVN0YXRlPENsaWVudCwgJ2NsaWVudCc+XG4gKiAgICAgICAgPignY2xpZW50JyksXG4gKiAgICB9KTtcbiAqXG4gKiAvLyB3aWxsIGdlbmVyYXRlXG4gKiB0cmFpdHMuYWN0aW9ucy5sb2FkQ2xpZW50KHtpZDoxMjN9KTtcbiAqIHRyYWl0cy5hY3Rpb25zLmxvYWRDbGllbnRTdWNjZXNzKHtjbGllbnQ6IHtpZDogJzEyMycsIG5hbWU6ICdnYWJzJ319KTtcbiAqIHRyYWl0cy5hY3Rpb25zLmxvYWRDbGllbnRGYWlsKCk7XG4gKiB0cmFpdHMuc2VsZWN0b3JzLnNlbGVjdENsaWVudFxuICogdHJhaXRzLnNlbGVjdG9ycy5pc0xvYWRpbmdMb2FkQ2xpZW50XG4gKiB0cmFpdHMuc2VsZWN0b3JzLmlzU3VjY2Vzc0xvYWRDbGllbnRcbiAqIHRyYWl0cy5zZWxlY3RvcnMuaXNGYWlsTG9hZENsaWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkTG9hZEVudGl0eTxcbiAgSiBleHRlbmRzIHN0cmluZyxcbiAgUmVxdWVzdCBleHRlbmRzIG9iamVjdCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbiAgUmVzcG9uc2UgZXh0ZW5kcyBSZWNvcmQ8SiwgYW55PiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbiAgRmFpbHVyZSBleHRlbmRzIG9iamVjdCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbiAgRW50aXR5ID0gUmVjb3JkRW50aXR5PFJlc3BvbnNlPixcbiAgU3RhdGUgPSBMb2FkRW50aXR5U3RhdGU8RW50aXR5LCBKPixcbj4oe1xuICBlbnRpdHlOYW1lLFxuICBhY3Rpb25Qcm9wcyxcbiAgYWN0aW9uU3VjY2Vzc1Byb3BzLFxuICBhY3Rpb25GYWlsUHJvcHMsXG59OiB7XG4gIGVudGl0eU5hbWU6IEo7XG4gIGFjdGlvblByb3BzPzogQWN0aW9uQ3JlYXRvclByb3BzPFJlcXVlc3Q+O1xuICBhY3Rpb25TdWNjZXNzUHJvcHM/OiBBY3Rpb25DcmVhdG9yUHJvcHM8UmVzcG9uc2U+O1xuICBhY3Rpb25GYWlsUHJvcHM/OiBBY3Rpb25DcmVhdG9yUHJvcHM8RmFpbHVyZT47XG59KSB7XG4gIGNvbnN0IGNhcGl0YWxpemVkTmFtZSA9XG4gICAgZW50aXR5TmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGVudGl0eU5hbWUuc2xpY2UoMSk7XG5cbiAgdHlwZSBLID0gYGxvYWQke0NhcGl0YWxpemU8SiAmIHN0cmluZz59YDtcblxuICByZXR1cm4gW1xuICAgIGFkZEFzeW5jQWN0aW9uPEssIFJlcXVlc3QsIFJlc3BvbnNlLCBGYWlsdXJlPih7XG4gICAgICBuYW1lOiAoJ2xvYWQnICsgY2FwaXRhbGl6ZWROYW1lKSBhcyBLLFxuICAgICAgYWN0aW9uUHJvcHMsXG4gICAgICBhY3Rpb25TdWNjZXNzUHJvcHMsXG4gICAgICBhY3Rpb25GYWlsUHJvcHMsXG4gICAgfSksXG4gICAgY3JlYXRlVHJhaXRGYWN0b3J5KHtcbiAgICAgIGtleTogYGxvYWQke2NhcGl0YWxpemVkTmFtZX1gLFxuICAgICAgY29uZmlnOiB7IGVudGl0eU5hbWUsIGFjdGlvblByb3BzLCBhY3Rpb25TdWNjZXNzUHJvcHMsIGFjdGlvbkZhaWxQcm9wcyB9LFxuICAgICAgc2VsZWN0b3JzOiAoKSA9PiB7XG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdEVudGl0eShzdGF0ZTogU3RhdGUpIHtcbiAgICAgICAgICByZXR1cm4gKHN0YXRlIGFzIGFueSlbYCR7ZW50aXR5TmFtZX1gXSBhcyBFbnRpdHk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIFtgc2VsZWN0JHtjYXBpdGFsaXplZE5hbWV9YF06IHNlbGVjdEVudGl0eSxcbiAgICAgICAgfSBhcyBMb2FkRW50aXR5U2VsZWN0b3JzPEVudGl0eSwgSj47XG4gICAgICB9LFxuICAgICAgaW5pdGlhbFN0YXRlOiAoe1xuICAgICAgICBwcmV2aW91c0luaXRpYWxTdGF0ZSxcbiAgICAgIH06IFRyYWl0SW5pdGlhbFN0YXRlRmFjdG9yeUNvbmZpZykgPT4gcHJldmlvdXNJbml0aWFsU3RhdGUgYXMgU3RhdGUsXG4gICAgICByZWR1Y2VyOiAoeyBpbml0aWFsU3RhdGUsIGFsbEFjdGlvbnMgfSkgPT4ge1xuICAgICAgICByZXR1cm4gY3JlYXRlUmVkdWNlcihcbiAgICAgICAgICBpbml0aWFsU3RhdGUsXG4gICAgICAgICAgb24oXG4gICAgICAgICAgICAoYWxsQWN0aW9ucyBhcyBhbnkpW2Bsb2FkJHtjYXBpdGFsaXplZE5hbWV9U3VjY2Vzc2BdLFxuICAgICAgICAgICAgKHN0YXRlOiBhbnksIGFjdGlvbjogYW55KSA9PiAoe1xuICAgICAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICAgICAgW2VudGl0eU5hbWVdOiBhY3Rpb25bZW50aXR5TmFtZV0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9KSxcbiAgXSBhcyBjb25zdDtcbn1cbiJdfQ==
