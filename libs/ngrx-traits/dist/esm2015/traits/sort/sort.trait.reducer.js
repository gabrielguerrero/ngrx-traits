import { createReducer, on } from '@ngrx/store';
export function createSortInitialState(previousInitialState, allConfigs) {
  const { defaultSort } = allConfigs.sort;
  return Object.assign(Object.assign({}, previousInitialState), {
    sort: {
      current: defaultSort,
      default: defaultSort,
    },
  });
}
export function createSortTraitReducer(
  initialState,
  allActions,
  allMutators,
  allConfigs
) {
  const { remote } = allConfigs.sort;
  return createReducer(
    initialState,
    on(allActions.sort, (state, { active, direction }) =>
      !remote
        ? allMutators.sortEntities({ active, direction }, state)
        : Object.assign(Object.assign({}, state), {
            sort: Object.assign(Object.assign({}, state.sort), {
              current: { active, direction },
            }),
          })
    ),
    on(allActions.resetSort, (state) => {
      var _a, _b, _c;
      return ((_a = state.sort) === null || _a === void 0 ? void 0 : _a.default)
        ? !remote
          ? allMutators.sortEntities(
              (_b = state.sort) === null || _b === void 0 ? void 0 : _b.default,
              state
            )
          : Object.assign(Object.assign({}, state), {
              sort: Object.assign(Object.assign({}, state.sort), {
                current:
                  (_c = state.sort) === null || _c === void 0
                    ? void 0
                    : _c.default,
              }),
            })
        : state;
    })
  );
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC50cmFpdC5yZWR1Y2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdHJhaXRzL3NyYy9zb3J0L3NvcnQudHJhaXQucmVkdWNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQVNoRCxNQUFNLFVBQVUsc0JBQXNCLENBQ3BDLG9CQUF5QixFQUN6QixVQUFtQztJQUVuQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUssQ0FBQztJQUV6Qyx1Q0FDSyxvQkFBb0IsS0FDdkIsSUFBSSxFQUFFO1lBQ0osT0FBTyxFQUFFLFdBQVc7WUFDcEIsT0FBTyxFQUFFLFdBQVc7U0FDckIsSUFDRDtBQUNKLENBQUM7QUFFRCxNQUFNLFVBQVUsc0JBQXNCLENBSXBDLFlBQWUsRUFDZixVQUE2RCxFQUM3RCxXQUFpQyxFQUNqQyxVQUFxRTtJQUVyRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUssQ0FBQztJQUVwQyxPQUFPLGFBQWEsQ0FDbEIsWUFBWSxFQUNaLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FDbkQsQ0FBQyxNQUFNO1FBQ0wsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsS0FBSyxDQUFDO1FBQ3hELENBQUMsaUNBQ00sS0FBSyxLQUNSLElBQUksa0NBQU8sS0FBSyxDQUFDLElBQUksS0FBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQ3RELENBQ04sRUFDRCxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFOztRQUNqQyxPQUFBLE9BQUEsS0FBSyxDQUFDLElBQUksMENBQUUsT0FBTyxFQUNqQixDQUFDLENBQUMsQ0FBQyxNQUFNO1lBQ1AsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLE9BQUMsS0FBSyxDQUFDLElBQUksMENBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQztZQUN0RCxDQUFDLGlDQUNNLEtBQUssS0FDUixJQUFJLGtDQUFPLEtBQUssQ0FBQyxJQUFJLEtBQUUsT0FBTyxRQUFFLEtBQUssQ0FBQyxJQUFJLDBDQUFFLE9BQU8sTUFDcEQ7WUFDTCxDQUFDLENBQUMsS0FBSyxDQUFBO0tBQUEsQ0FDVixDQUNGLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlUmVkdWNlciwgb24gfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBMb2FkRW50aXRpZXNBY3Rpb25zLCBMb2FkRW50aXRpZXNLZXllZENvbmZpZyB9IGZyb20gJy4uL2xvYWQtZW50aXRpZXMnO1xuaW1wb3J0IHtcbiAgRW50aXR5QW5kU29ydFN0YXRlLFxuICBTb3J0QWN0aW9ucyxcbiAgU29ydEtleWVkQ29uZmlnLFxuICBTb3J0TXV0YXRvcnMsXG59IGZyb20gJy4vc29ydC5tb2RlbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTb3J0SW5pdGlhbFN0YXRlPEVudGl0eT4oXG4gIHByZXZpb3VzSW5pdGlhbFN0YXRlOiBhbnksXG4gIGFsbENvbmZpZ3M6IFNvcnRLZXllZENvbmZpZzxFbnRpdHk+LFxuKTogRW50aXR5QW5kU29ydFN0YXRlPEVudGl0eT4ge1xuICBjb25zdCB7IGRlZmF1bHRTb3J0IH0gPSBhbGxDb25maWdzLnNvcnQhO1xuXG4gIHJldHVybiB7XG4gICAgLi4ucHJldmlvdXNJbml0aWFsU3RhdGUsXG4gICAgc29ydDoge1xuICAgICAgY3VycmVudDogZGVmYXVsdFNvcnQsXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0U29ydCxcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU29ydFRyYWl0UmVkdWNlcjxcbiAgRW50aXR5LFxuICBTIGV4dGVuZHMgRW50aXR5QW5kU29ydFN0YXRlPEVudGl0eT4gPSBFbnRpdHlBbmRTb3J0U3RhdGU8RW50aXR5Pixcbj4oXG4gIGluaXRpYWxTdGF0ZTogUyxcbiAgYWxsQWN0aW9uczogU29ydEFjdGlvbnM8RW50aXR5PiAmIExvYWRFbnRpdGllc0FjdGlvbnM8RW50aXR5PixcbiAgYWxsTXV0YXRvcnM6IFNvcnRNdXRhdG9yczxFbnRpdHk+LFxuICBhbGxDb25maWdzOiBMb2FkRW50aXRpZXNLZXllZENvbmZpZzxFbnRpdHk+ICYgU29ydEtleWVkQ29uZmlnPEVudGl0eT4sXG4pIHtcbiAgY29uc3QgeyByZW1vdGUgfSA9IGFsbENvbmZpZ3Muc29ydCE7XG5cbiAgcmV0dXJuIGNyZWF0ZVJlZHVjZXIoXG4gICAgaW5pdGlhbFN0YXRlLFxuICAgIG9uKGFsbEFjdGlvbnMuc29ydCwgKHN0YXRlLCB7IGFjdGl2ZSwgZGlyZWN0aW9uIH0pID0+XG4gICAgICAhcmVtb3RlXG4gICAgICAgID8gYWxsTXV0YXRvcnMuc29ydEVudGl0aWVzKHsgYWN0aXZlLCBkaXJlY3Rpb24gfSwgc3RhdGUpXG4gICAgICAgIDoge1xuICAgICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgICBzb3J0OiB7IC4uLnN0YXRlLnNvcnQsIGN1cnJlbnQ6IHsgYWN0aXZlLCBkaXJlY3Rpb24gfSB9LFxuICAgICAgICAgIH0sXG4gICAgKSxcbiAgICBvbihhbGxBY3Rpb25zLnJlc2V0U29ydCwgKHN0YXRlKSA9PlxuICAgICAgc3RhdGUuc29ydD8uZGVmYXVsdFxuICAgICAgICA/ICFyZW1vdGVcbiAgICAgICAgICA/IGFsbE11dGF0b3JzLnNvcnRFbnRpdGllcyhzdGF0ZS5zb3J0Py5kZWZhdWx0LCBzdGF0ZSlcbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgICAgIHNvcnQ6IHsgLi4uc3RhdGUuc29ydCwgY3VycmVudDogc3RhdGUuc29ydD8uZGVmYXVsdCB9LFxuICAgICAgICAgICAgfVxuICAgICAgICA6IHN0YXRlLFxuICAgICksXG4gICk7XG59XG4iXX0=
