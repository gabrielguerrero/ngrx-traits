import { createTraitFactory } from 'ngrx-traits';
import { createAction, createReducer, on } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { TraitEffect } from 'ngrx-traits';
import { createEffect, ofType } from '@ngrx/effects';
import { mapTo } from 'rxjs/operators';
export function addReset(traitConfig = {}) {
  return createTraitFactory({
    key: 'reset',
    config: traitConfig,
    actions: ({ actionsGroupKey }) => ({
      reset: createAction(`${actionsGroupKey} Reset State`),
    }),
    reducer: ({ allActions, initialState }) =>
      createReducer(
        initialState,
        on(allActions.reset, () => initialState)
      ),
    effects: ({ allActions }) => {
      var _a;
      class ResetEffect extends TraitEffect {
        constructor() {
          var _a;
          super(...arguments);
          this.externalReset$ =
            ((_a =
              traitConfig === null || traitConfig === void 0
                ? void 0
                : traitConfig.resetOn) === null || _a === void 0
              ? void 0
              : _a.length) &&
            createEffect(() => {
              return this.actions$.pipe(
                ofType(
                  ...(traitConfig === null || traitConfig === void 0
                    ? void 0
                    : traitConfig.resetOn)
                ),
                mapTo(allActions.reset())
              );
            });
        }
      }
      ResetEffect.decorators = [{ type: Injectable }];
      return (
        (_a =
          traitConfig === null || traitConfig === void 0
            ? void 0
            : traitConfig.resetOn) === null || _a === void 0
          ? void 0
          : _a.length
      )
        ? [ResetEffect]
        : [];
    },
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZXQudHJhaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90cmFpdHMvc3JjL3Jlc2V0L3Jlc2V0LnRyYWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUdqRCxPQUFPLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2QyxNQUFNLFVBQVUsUUFBUSxDQUN0QixjQUVJLEVBQUU7SUFFTixPQUFPLGtCQUFrQixDQUFDO1FBQ3hCLEdBQUcsRUFBRSxPQUFPO1FBQ1osTUFBTSxFQUFFLFdBQVc7UUFDbkIsT0FBTyxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQTZCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDNUQsS0FBSyxFQUFFLFlBQVksQ0FBQyxHQUFHLGVBQWUsY0FBYyxDQUFDO1NBQ3RELENBQUM7UUFDRixPQUFPLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLENBQ3hDLGFBQWEsQ0FDWCxZQUFZLEVBQ1osRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQ3pDO1FBQ0gsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFOztZQUMxQixNQUNNLFdBQVksU0FBUSxXQUFXO2dCQURyQzs7O29CQUVFLG1CQUFjLEdBQ1osT0FBQSxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsT0FBTywwQ0FBRSxNQUFNO3dCQUM1QixZQUFZLENBQUMsR0FBRyxFQUFFOzRCQUNoQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUN2QixNQUFNLENBQUMsR0FBRyxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsT0FBTyxDQUFDLEVBQy9CLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FDMUIsQ0FBQzt3QkFDSixDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDOzs7d0JBVkEsVUFBVTs7WUFXWCxPQUFPLE9BQUEsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLE9BQU8sMENBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDM0QsQ0FBQztLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVUcmFpdEZhY3RvcnkgfSBmcm9tICduZ3J4LXRyYWl0cyc7XG5pbXBvcnQgeyBHZW5lcmljQWN0aW9uQ3JlYXRvciB9IGZyb20gJy4uL2xvYWQtZW50aXRpZXMnO1xuaW1wb3J0IHsgVHJhaXRBY3Rpb25zRmFjdG9yeUNvbmZpZyB9IGZyb20gJ25ncngtdHJhaXRzJztcbmltcG9ydCB7IGNyZWF0ZUFjdGlvbiwgY3JlYXRlUmVkdWNlciwgb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBUcmFpdEVmZmVjdCB9IGZyb20gJ25ncngtdHJhaXRzJztcbmltcG9ydCB7IGNyZWF0ZUVmZmVjdCwgb2ZUeXBlIH0gZnJvbSAnQG5ncngvZWZmZWN0cyc7XG5pbXBvcnQgeyBtYXBUbyB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlc2V0KFxuICB0cmFpdENvbmZpZzoge1xuICAgIHJlc2V0T24/OiBHZW5lcmljQWN0aW9uQ3JlYXRvcltdO1xuICB9ID0ge30sXG4pIHtcbiAgcmV0dXJuIGNyZWF0ZVRyYWl0RmFjdG9yeSh7XG4gICAga2V5OiAncmVzZXQnLFxuICAgIGNvbmZpZzogdHJhaXRDb25maWcsXG4gICAgYWN0aW9uczogKHsgYWN0aW9uc0dyb3VwS2V5IH06IFRyYWl0QWN0aW9uc0ZhY3RvcnlDb25maWcpID0+ICh7XG4gICAgICByZXNldDogY3JlYXRlQWN0aW9uKGAke2FjdGlvbnNHcm91cEtleX0gUmVzZXQgU3RhdGVgKSxcbiAgICB9KSxcbiAgICByZWR1Y2VyOiAoeyBhbGxBY3Rpb25zLCBpbml0aWFsU3RhdGUgfSkgPT5cbiAgICAgIGNyZWF0ZVJlZHVjZXIoXG4gICAgICAgIGluaXRpYWxTdGF0ZSxcbiAgICAgICAgb24oYWxsQWN0aW9ucy5yZXNldCwgKCkgPT4gaW5pdGlhbFN0YXRlKSxcbiAgICAgICksXG4gICAgZWZmZWN0czogKHsgYWxsQWN0aW9ucyB9KSA9PiB7XG4gICAgICBASW5qZWN0YWJsZSgpXG4gICAgICBjbGFzcyBSZXNldEVmZmVjdCBleHRlbmRzIFRyYWl0RWZmZWN0IHtcbiAgICAgICAgZXh0ZXJuYWxSZXNldCQgPVxuICAgICAgICAgIHRyYWl0Q29uZmlnPy5yZXNldE9uPy5sZW5ndGggJiZcbiAgICAgICAgICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0aW9ucyQucGlwZShcbiAgICAgICAgICAgICAgb2ZUeXBlKC4uLnRyYWl0Q29uZmlnPy5yZXNldE9uKSxcbiAgICAgICAgICAgICAgbWFwVG8oYWxsQWN0aW9ucy5yZXNldCgpKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJhaXRDb25maWc/LnJlc2V0T24/Lmxlbmd0aCA/IFtSZXNldEVmZmVjdF0gOiBbXTtcbiAgICB9LFxuICB9KTtcbn1cbiJdfQ==
