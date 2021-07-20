import { Injectable } from '@angular/core';
import { TraitEffect } from 'ngrx-traits';
import { asyncScheduler, EMPTY, of, timer } from 'rxjs';
import {
  concatMap,
  debounce,
  distinctUntilChanged,
  first,
  map,
} from 'rxjs/operators';
import { createEffect, ofType } from '@ngrx/effects';
export function createFilterTraitEffects(allActions, allSelectors, allConfigs) {
  const traitConfig = allConfigs.filter;
  class FilterEffect extends TraitEffect {
    constructor() {
      super(...arguments);
      this.storeFilter$ = createEffect(
        () =>
          ({
            debounce: debounceTime = traitConfig.defaultDebounceTime,
            scheduler = asyncScheduler,
          } = {}) =>
            this.actions$.pipe(
              ofType(allActions.filter),
              debounce((value) =>
                (value === null || value === void 0 ? void 0 : value.forceLoad)
                  ? EMPTY
                  : timer(debounceTime, scheduler)
              ),
              concatMap((payload) =>
                payload.patch
                  ? this.store.select(allSelectors.selectFilter).pipe(
                      first(),
                      map((storedFilters) =>
                        Object.assign(Object.assign({}, payload), {
                          filters: Object.assign(
                            Object.assign({}, storedFilters),
                            payload === null || payload === void 0
                              ? void 0
                              : payload.filters
                          ),
                        })
                      )
                    )
                  : of(payload)
              ),
              distinctUntilChanged(
                (previous, current) =>
                  !(current === null || current === void 0
                    ? void 0
                    : current.forceLoad) &&
                  JSON.stringify(
                    previous === null || previous === void 0
                      ? void 0
                      : previous.filters
                  ) ===
                    JSON.stringify(
                      current === null || current === void 0
                        ? void 0
                        : current.filters
                    )
              ),
              map((action) =>
                allActions.storeFilter({
                  filters:
                    action === null || action === void 0
                      ? void 0
                      : action.filters,
                  patch:
                    action === null || action === void 0
                      ? void 0
                      : action.patch,
                })
              )
            )
      );
      this.fetch$ =
        !(traitConfig === null || traitConfig === void 0
          ? void 0
          : traitConfig.filterFn) &&
        createEffect(() => {
          return this.actions$.pipe(
            ofType(allActions['storeFilter']),
            concatMap(() =>
              (
                allActions === null || allActions === void 0
                  ? void 0
                  : allActions.loadFirstPage
              )
                ? [allActions.clearPagesCache(), allActions.loadFirstPage()]
                : [allActions.fetch()]
            )
          );
        });
    }
  }
  FilterEffect.decorators = [{ type: Injectable }];
  return [FilterEffect];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLnRyYWl0LmVmZmVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RyYWl0cy9zcmMvZmlsdGVyL2ZpbHRlci50cmFpdC5lZmZlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDeEQsT0FBTyxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1Isb0JBQW9CLEVBQ3BCLEtBQUssRUFDTCxHQUFHLEdBQ0osTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQVVyRCxNQUFNLFVBQVUsd0JBQXdCLENBQ3RDLFVBRW1CLEVBQ25CLFlBQXdFLEVBQ3hFLFVBQXdDO0lBRXhDLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDdEMsTUFDTSxZQUFhLFNBQVEsV0FBVztRQUR0Qzs7WUFFRSxpQkFBWSxHQUFHLFlBQVksQ0FDekIsR0FBRyxFQUFFLENBQ0gsQ0FBQyxFQUNDLFFBQVEsRUFBRSxZQUFZLEdBQUcsV0FBWSxDQUFDLG1CQUFtQixFQUN6RCxTQUFTLEdBQUcsY0FBYyxNQUN4QixFQUFFLEVBQUUsRUFBRSxDQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUNoQixNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUN6QixRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUNqQixDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FDMUQsRUFDRCxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUNwQixPQUFPLENBQUMsS0FBSztnQkFDWCxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FDL0MsS0FBSyxFQUFFLEVBQ1AsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxpQ0FDbEIsT0FBTyxLQUNWLE9BQU8sa0NBQU8sYUFBYSxHQUFLLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLEtBQ2hELENBQUMsQ0FDSjtnQkFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUNoQixFQUNELG9CQUFvQixDQUNsQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUNwQixFQUFDLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxTQUFTLENBQUE7Z0JBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLE9BQU8sQ0FBQztvQkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsT0FBTyxDQUFDLENBQ3JDLEVBQ0QsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FDYixVQUFVLENBQUMsV0FBVyxDQUFDO2dCQUNyQixPQUFPLEVBQUUsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLE9BQU87Z0JBQ3hCLEtBQUssRUFBRSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsS0FBSzthQUNyQixDQUFDLENBQ0gsQ0FDRixDQUNOLENBQUM7WUFFRixXQUFNLEdBQ0osRUFBQyxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsUUFBUSxDQUFBO2dCQUN0QixZQUFZLENBQUMsR0FBRyxFQUFFO29CQUNoQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUN2QixNQUFNLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQ2pDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FDYixDQUFBLFVBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxhQUFhLEVBQ3ZCLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUM7d0JBQzVELENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUN6QixDQUNGLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDOzs7Z0JBbkRBLFVBQVU7O0lBcURYLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVHJhaXRFZmZlY3QgfSBmcm9tICduZ3J4LXRyYWl0cyc7XG5pbXBvcnQgeyBhc3luY1NjaGVkdWxlciwgRU1QVFksIG9mLCB0aW1lciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgY29uY2F0TWFwLFxuICBkZWJvdW5jZSxcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIGZpcnN0LFxuICBtYXAsXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IGNyZWF0ZUVmZmVjdCwgb2ZUeXBlIH0gZnJvbSAnQG5ncngvZWZmZWN0cyc7XG5pbXBvcnQgeyBGaWx0ZXJLZXllZENvbmZpZywgRmlsdGVyU2VsZWN0b3JzIH0gZnJvbSAnLi9maWx0ZXIubW9kZWwnO1xuaW1wb3J0IHtcbiAgTG9hZEVudGl0aWVzQWN0aW9ucyxcbiAgTG9hZEVudGl0aWVzU2VsZWN0b3JzLFxufSBmcm9tICcuLi9sb2FkLWVudGl0aWVzL2xvYWQtZW50aXRpZXMubW9kZWwnO1xuaW1wb3J0IHsgVHlwZSB9IGZyb20gJ25ncngtdHJhaXRzJztcbmltcG9ydCB7IMafRmlsdGVyQWN0aW9ucyB9IGZyb20gJy4vZmlsdGVyLm1vZGVsLmludGVybmFsJztcbmltcG9ydCB7IFBhZ2luYXRpb25BY3Rpb25zIH0gZnJvbSAnLi4vcGFnaW5hdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGaWx0ZXJUcmFpdEVmZmVjdHM8RW50aXR5LCBGPihcbiAgYWxsQWN0aW9uczogxp9GaWx0ZXJBY3Rpb25zPEY+ICZcbiAgICBMb2FkRW50aXRpZXNBY3Rpb25zPEVudGl0eT4gJlxuICAgIFBhZ2luYXRpb25BY3Rpb25zLFxuICBhbGxTZWxlY3RvcnM6IEZpbHRlclNlbGVjdG9yczxFbnRpdHksIEY+ICYgTG9hZEVudGl0aWVzU2VsZWN0b3JzPEVudGl0eT4sXG4gIGFsbENvbmZpZ3M6IEZpbHRlcktleWVkQ29uZmlnPEVudGl0eSwgRj4sXG4pOiBUeXBlPFRyYWl0RWZmZWN0PltdIHtcbiAgY29uc3QgdHJhaXRDb25maWcgPSBhbGxDb25maWdzLmZpbHRlcjtcbiAgQEluamVjdGFibGUoKVxuICBjbGFzcyBGaWx0ZXJFZmZlY3QgZXh0ZW5kcyBUcmFpdEVmZmVjdCB7XG4gICAgc3RvcmVGaWx0ZXIkID0gY3JlYXRlRWZmZWN0KFxuICAgICAgKCkgPT5cbiAgICAgICAgKHtcbiAgICAgICAgICBkZWJvdW5jZTogZGVib3VuY2VUaW1lID0gdHJhaXRDb25maWchLmRlZmF1bHREZWJvdW5jZVRpbWUsXG4gICAgICAgICAgc2NoZWR1bGVyID0gYXN5bmNTY2hlZHVsZXIsXG4gICAgICAgIH0gPSB7fSkgPT5cbiAgICAgICAgICB0aGlzLmFjdGlvbnMkLnBpcGUoXG4gICAgICAgICAgICBvZlR5cGUoYWxsQWN0aW9ucy5maWx0ZXIpLFxuICAgICAgICAgICAgZGVib3VuY2UoKHZhbHVlKSA9PlxuICAgICAgICAgICAgICB2YWx1ZT8uZm9yY2VMb2FkID8gRU1QVFkgOiB0aW1lcihkZWJvdW5jZVRpbWUsIHNjaGVkdWxlciksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgY29uY2F0TWFwKChwYXlsb2FkKSA9PlxuICAgICAgICAgICAgICBwYXlsb2FkLnBhdGNoXG4gICAgICAgICAgICAgICAgPyB0aGlzLnN0b3JlLnNlbGVjdChhbGxTZWxlY3RvcnMuc2VsZWN0RmlsdGVyKS5waXBlKFxuICAgICAgICAgICAgICAgICAgICBmaXJzdCgpLFxuICAgICAgICAgICAgICAgICAgICBtYXAoKHN0b3JlZEZpbHRlcnMpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgLi4ucGF5bG9hZCxcbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzOiB7IC4uLnN0b3JlZEZpbHRlcnMsIC4uLnBheWxvYWQ/LmZpbHRlcnMgfSxcbiAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIDogb2YocGF5bG9hZCksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoXG4gICAgICAgICAgICAgIChwcmV2aW91cywgY3VycmVudCkgPT5cbiAgICAgICAgICAgICAgICAhY3VycmVudD8uZm9yY2VMb2FkICYmXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocHJldmlvdXM/LmZpbHRlcnMpID09PVxuICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoY3VycmVudD8uZmlsdGVycyksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbWFwKChhY3Rpb24pID0+XG4gICAgICAgICAgICAgIGFsbEFjdGlvbnMuc3RvcmVGaWx0ZXIoe1xuICAgICAgICAgICAgICAgIGZpbHRlcnM6IGFjdGlvbj8uZmlsdGVycyxcbiAgICAgICAgICAgICAgICBwYXRjaDogYWN0aW9uPy5wYXRjaCxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICApLFxuICAgICAgICAgICksXG4gICAgKTtcblxuICAgIGZldGNoJCA9XG4gICAgICAhdHJhaXRDb25maWc/LmZpbHRlckZuICYmXG4gICAgICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hY3Rpb25zJC5waXBlKFxuICAgICAgICAgIG9mVHlwZShhbGxBY3Rpb25zWydzdG9yZUZpbHRlciddKSxcbiAgICAgICAgICBjb25jYXRNYXAoKCkgPT5cbiAgICAgICAgICAgIGFsbEFjdGlvbnM/LmxvYWRGaXJzdFBhZ2VcbiAgICAgICAgICAgICAgPyBbYWxsQWN0aW9ucy5jbGVhclBhZ2VzQ2FjaGUoKSwgYWxsQWN0aW9ucy5sb2FkRmlyc3RQYWdlKCldXG4gICAgICAgICAgICAgIDogW2FsbEFjdGlvbnMuZmV0Y2goKV0sXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIFtGaWx0ZXJFZmZlY3RdO1xufVxuIl19
