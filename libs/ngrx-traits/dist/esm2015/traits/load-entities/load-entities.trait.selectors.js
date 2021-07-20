import { isFail, isLoading, isSuccess } from './load-entities.utils';
import { createSelector } from '@ngrx/store';
import { selectFilter } from '../filter/filter.trait.selectors';
export function createLoadEntitiesTraitSelectors(allConfigs) {
  var _a, _b;
  const adapter =
    (_a =
      allConfigs === null || allConfigs === void 0
        ? void 0
        : allConfigs.loadEntities) === null || _a === void 0
      ? void 0
      : _a.adapter;
  const entitySelectors =
    adapter === null || adapter === void 0 ? void 0 : adapter.getSelectors();
  const filterFunction =
    (_b =
      allConfigs === null || allConfigs === void 0
        ? void 0
        : allConfigs.filter) === null || _b === void 0
      ? void 0
      : _b.filterFn;
  let selectors = entitySelectors;
  if (filterFunction && entitySelectors) {
    const selectAll = createSelector(
      entitySelectors.selectAll,
      selectFilter,
      (entities, filters) =>
        filters ? entities.filter((e) => filterFunction(filters, e)) : entities
    );
    selectors = {
      selectAll,
      selectEntities: createSelector(
        entitySelectors.selectEntities,
        selectFilter,
        (entities, filters) => {
          const result = {};
          for (const id in entities) {
            const e = entities[id];
            if (filterFunction(filters, e)) {
              result[id] = e;
            }
          }
          return result;
        }
      ),
      selectTotal: createSelector(selectAll, (entities) => entities.length),
      selectIds: createSelector(selectAll, (entities) =>
        entities.map((e) =>
          adapter === null || adapter === void 0 ? void 0 : adapter.selectId(e)
        )
      ),
    };
  }
  return Object.assign(Object.assign({}, selectors), {
    isFail,
    isLoading,
    isSuccess,
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZC1lbnRpdGllcy50cmFpdC5zZWxlY3RvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90cmFpdHMvc3JjL2xvYWQtZW50aXRpZXMvbG9hZC1lbnRpdGllcy50cmFpdC5zZWxlY3RvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUM3QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFFaEUsTUFBTSxVQUFVLGdDQUFnQyxDQUM5QyxVQUNvQzs7SUFFcEMsTUFBTSxPQUFPLFNBQUcsVUFBVSxhQUFWLFVBQVUsdUJBQVYsVUFBVSxDQUFFLFlBQVksMENBQUUsT0FBTyxDQUFDO0lBQ2xELE1BQU0sZUFBZSxHQUFHLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxZQUFZLEVBQUUsQ0FBQztJQUVoRCxNQUFNLGNBQWMsU0FBRyxVQUFVLGFBQVYsVUFBVSx1QkFBVixVQUFVLENBQUUsTUFBTSwwQ0FBRSxRQUFRLENBQUM7SUFDcEQsSUFBSSxTQUFTLEdBQUcsZUFBZSxDQUFDO0lBQ2hDLElBQUksY0FBYyxJQUFJLGVBQWUsRUFBRTtRQUNyQyxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQzlCLGVBQWUsQ0FBQyxTQUFTLEVBQ3pCLFlBQVksRUFDWixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUNwQixPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUMxRSxDQUFDO1FBRUYsU0FBUyxHQUFHO1lBQ1YsU0FBUztZQUNULGNBQWMsRUFBRSxjQUFjLENBQzVCLGVBQWUsQ0FBQyxjQUFjLEVBQzlCLFlBQVksRUFDWixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDcEIsTUFBTSxNQUFNLEdBQXVCLEVBQUUsQ0FBQztnQkFDdEMsS0FBSyxNQUFNLEVBQUUsSUFBSSxRQUFRLEVBQUU7b0JBQ3pCLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdkIsSUFBSSxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUUsQ0FBQyxFQUFFO3dCQUMvQixNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNoQjtpQkFDRjtnQkFDRCxPQUFPLE1BQU0sQ0FBQztZQUNoQixDQUFDLENBQ0Y7WUFDRCxXQUFXLEVBQUUsY0FBYyxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNyRSxTQUFTLEVBQUUsY0FBYyxDQUN2QixTQUFTLEVBQ1QsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUNYLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQXdCLENBQ25FO1NBQ0YsQ0FBQztLQUNIO0lBQ0QsT0FBTyxnQ0FDRixTQUFTLEtBQ1osTUFBTTtRQUNOLFNBQVM7UUFDVCxTQUFTLEdBQ3VCLENBQUM7QUFDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpY3Rpb25hcnkgfSBmcm9tICdAbmdyeC9lbnRpdHknO1xuaW1wb3J0IHtcbiAgTG9hZEVudGl0aWVzS2V5ZWRDb25maWcsXG4gIExvYWRFbnRpdGllc1NlbGVjdG9ycyxcbn0gZnJvbSAnLi9sb2FkLWVudGl0aWVzLm1vZGVsJztcbmltcG9ydCB7IEZpbHRlcktleWVkQ29uZmlnIH0gZnJvbSAnLi4vZmlsdGVyJztcbmltcG9ydCB7IGlzRmFpbCwgaXNMb2FkaW5nLCBpc1N1Y2Nlc3MgfSBmcm9tICcuL2xvYWQtZW50aXRpZXMudXRpbHMnO1xuaW1wb3J0IHsgY3JlYXRlU2VsZWN0b3IgfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBzZWxlY3RGaWx0ZXIgfSBmcm9tICcuLi9maWx0ZXIvZmlsdGVyLnRyYWl0LnNlbGVjdG9ycyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2FkRW50aXRpZXNUcmFpdFNlbGVjdG9yczxFbnRpdHk+KFxuICBhbGxDb25maWdzPzogTG9hZEVudGl0aWVzS2V5ZWRDb25maWc8RW50aXR5PiAmXG4gICAgRmlsdGVyS2V5ZWRDb25maWc8RW50aXR5LCB1bmtub3duPixcbikge1xuICBjb25zdCBhZGFwdGVyID0gYWxsQ29uZmlncz8ubG9hZEVudGl0aWVzPy5hZGFwdGVyO1xuICBjb25zdCBlbnRpdHlTZWxlY3RvcnMgPSBhZGFwdGVyPy5nZXRTZWxlY3RvcnMoKTtcblxuICBjb25zdCBmaWx0ZXJGdW5jdGlvbiA9IGFsbENvbmZpZ3M/LmZpbHRlcj8uZmlsdGVyRm47XG4gIGxldCBzZWxlY3RvcnMgPSBlbnRpdHlTZWxlY3RvcnM7XG4gIGlmIChmaWx0ZXJGdW5jdGlvbiAmJiBlbnRpdHlTZWxlY3RvcnMpIHtcbiAgICBjb25zdCBzZWxlY3RBbGwgPSBjcmVhdGVTZWxlY3RvcihcbiAgICAgIGVudGl0eVNlbGVjdG9ycy5zZWxlY3RBbGwsXG4gICAgICBzZWxlY3RGaWx0ZXIsXG4gICAgICAoZW50aXRpZXMsIGZpbHRlcnMpID0+XG4gICAgICAgIGZpbHRlcnMgPyBlbnRpdGllcy5maWx0ZXIoKGUpID0+IGZpbHRlckZ1bmN0aW9uKGZpbHRlcnMsIGUpKSA6IGVudGl0aWVzLFxuICAgICk7XG5cbiAgICBzZWxlY3RvcnMgPSB7XG4gICAgICBzZWxlY3RBbGwsXG4gICAgICBzZWxlY3RFbnRpdGllczogY3JlYXRlU2VsZWN0b3IoXG4gICAgICAgIGVudGl0eVNlbGVjdG9ycy5zZWxlY3RFbnRpdGllcyxcbiAgICAgICAgc2VsZWN0RmlsdGVyLFxuICAgICAgICAoZW50aXRpZXMsIGZpbHRlcnMpID0+IHtcbiAgICAgICAgICBjb25zdCByZXN1bHQ6IERpY3Rpb25hcnk8RW50aXR5PiA9IHt9O1xuICAgICAgICAgIGZvciAoY29uc3QgaWQgaW4gZW50aXRpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGUgPSBlbnRpdGllc1tpZF07XG4gICAgICAgICAgICBpZiAoZmlsdGVyRnVuY3Rpb24oZmlsdGVycywgZSEpKSB7XG4gICAgICAgICAgICAgIHJlc3VsdFtpZF0gPSBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgKSxcbiAgICAgIHNlbGVjdFRvdGFsOiBjcmVhdGVTZWxlY3RvcihzZWxlY3RBbGwsIChlbnRpdGllcykgPT4gZW50aXRpZXMubGVuZ3RoKSxcbiAgICAgIHNlbGVjdElkczogY3JlYXRlU2VsZWN0b3IoXG4gICAgICAgIHNlbGVjdEFsbCxcbiAgICAgICAgKGVudGl0aWVzKSA9PlxuICAgICAgICAgIGVudGl0aWVzLm1hcCgoZSkgPT4gYWRhcHRlcj8uc2VsZWN0SWQoZSkpIGFzIHN0cmluZ1tdIHwgbnVtYmVyW10sXG4gICAgICApLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICAuLi5zZWxlY3RvcnMsXG4gICAgaXNGYWlsLFxuICAgIGlzTG9hZGluZyxcbiAgICBpc1N1Y2Nlc3MsXG4gIH0gYXMgTG9hZEVudGl0aWVzU2VsZWN0b3JzPEVudGl0eT47XG59XG4iXX0=
