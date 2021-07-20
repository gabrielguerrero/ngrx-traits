export function createPaginationTraitMutators(allSelectors, allConfigs) {
  const adapter = allConfigs.loadEntities.adapter;
  function mergePaginatedEntities(entities, total = undefined, state) {
    const cacheType = state.pagination.cache.type;
    switch (cacheType) {
      case 'full':
        return adapter.setAll(
          entities,
          Object.assign(Object.assign({}, state), {
            pagination: Object.assign(Object.assign({}, state.pagination), {
              total: entities.length,
              cache: Object.assign(Object.assign({}, state.pagination.cache), {
                start: 0,
                end: entities.length,
              }),
            }),
          })
        );
      case 'partial': {
        const isPreloadNextPages =
          state.pagination.currentPage + 1 === state.pagination.requestPage;
        const start = state.pagination.currentPage * state.pagination.pageSize;
        const newEntities = isPreloadNextPages
          ? [...allSelectors.selectPageEntities(state), ...entities]
          : entities;
        return adapter.setAll(
          newEntities,
          Object.assign(Object.assign({}, state), {
            pagination: Object.assign(Object.assign({}, state.pagination), {
              total,
              cache: Object.assign(Object.assign({}, state.pagination.cache), {
                start,
                end: start + entities.length,
              }),
            }),
          })
        );
      }
      case 'grow':
        return adapter.addMany(
          entities,
          Object.assign(Object.assign({}, state), {
            pagination: Object.assign(Object.assign({}, state.pagination), {
              total,
              cache: Object.assign(Object.assign({}, state.pagination.cache), {
                end: state.ids.length + entities.length,
              }),
            }),
          })
        );
    }
    return state;
  }
  return { mergePaginatedEntities };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi50cmFpdC5tdXRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RyYWl0cy9zcmMvcGFnaW5hdGlvbi9wYWdpbmF0aW9uLnRyYWl0Lm11dGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLE1BQU0sVUFBVSw2QkFBNkIsQ0FDM0MsWUFBeUMsRUFDekMsVUFBMkM7SUFFM0MsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFlBQWEsQ0FBQyxPQUFPLENBQUM7SUFFakQsU0FBUyxzQkFBc0IsQ0FDN0IsUUFBa0IsRUFDbEIsS0FBSyxHQUFHLFNBQVMsRUFDakIsS0FBUTtRQUVSLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztRQUU5QyxRQUFRLFNBQVMsRUFBRTtZQUNqQixLQUFLLE1BQU07Z0JBQ1QsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsa0NBQ3pCLEtBQUssS0FDUixVQUFVLGtDQUNMLEtBQUssQ0FBQyxVQUFVLEtBQ25CLEtBQUssRUFBRSxRQUFRLENBQUMsTUFBTSxFQUN0QixLQUFLLGtDQUNBLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUN6QixLQUFLLEVBQUUsQ0FBQyxFQUNSLEdBQUcsRUFBRSxRQUFRLENBQUMsTUFBTSxVQUd4QixDQUFDO1lBQ0wsS0FBSyxTQUFTLENBQUMsQ0FBQztnQkFDZCxNQUFNLGtCQUFrQixHQUN0QixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7Z0JBRXBFLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO2dCQUN2RSxNQUFNLFdBQVcsR0FBRyxrQkFBa0I7b0JBQ3BDLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO29CQUMxRCxDQUFDLENBQUMsUUFBUSxDQUFDO2dCQUNiLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLGtDQUM1QixLQUFLLEtBQ1IsVUFBVSxrQ0FDTCxLQUFLLENBQUMsVUFBVSxLQUNuQixLQUFLLEVBQ0wsS0FBSyxrQ0FDQSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssS0FDekIsS0FBSyxFQUNMLEdBQUcsRUFBRSxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sVUFHaEMsQ0FBQzthQUNKO1lBQ0QsS0FBSyxNQUFNO2dCQUNULE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLGtDQUMxQixLQUFLLEtBQ1IsVUFBVSxrQ0FDTCxLQUFLLENBQUMsVUFBVSxLQUNuQixLQUFLLEVBQ0wsS0FBSyxrQ0FDQSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssS0FDekIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLFVBRzNDLENBQUM7U0FDTjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxDQUFDO0FBQ3BDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBFbnRpdHlBbmRQYWdpbmF0aW9uU3RhdGUsXG4gIFBhZ2luYXRpb25NdXRhdG9ycyxcbiAgUGFnaW5hdGlvblNlbGVjdG9ycyxcbn0gZnJvbSAnLi9wYWdpbmF0aW9uLm1vZGVsJztcbmltcG9ydCB7IExvYWRFbnRpdGllc0tleWVkQ29uZmlnIH0gZnJvbSAnLi4vbG9hZC1lbnRpdGllcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQYWdpbmF0aW9uVHJhaXRNdXRhdG9yczxFbnRpdHk+KFxuICBhbGxTZWxlY3RvcnM6IFBhZ2luYXRpb25TZWxlY3RvcnM8RW50aXR5PixcbiAgYWxsQ29uZmlnczogTG9hZEVudGl0aWVzS2V5ZWRDb25maWc8RW50aXR5Pixcbik6IFBhZ2luYXRpb25NdXRhdG9yczxFbnRpdHk+IHtcbiAgY29uc3QgYWRhcHRlciA9IGFsbENvbmZpZ3MubG9hZEVudGl0aWVzIS5hZGFwdGVyO1xuXG4gIGZ1bmN0aW9uIG1lcmdlUGFnaW5hdGVkRW50aXRpZXM8UyBleHRlbmRzIEVudGl0eUFuZFBhZ2luYXRpb25TdGF0ZTxFbnRpdHk+PihcbiAgICBlbnRpdGllczogRW50aXR5W10sXG4gICAgdG90YWwgPSB1bmRlZmluZWQsXG4gICAgc3RhdGU6IFMsXG4gICk6IFMge1xuICAgIGNvbnN0IGNhY2hlVHlwZSA9IHN0YXRlLnBhZ2luYXRpb24uY2FjaGUudHlwZTtcblxuICAgIHN3aXRjaCAoY2FjaGVUeXBlKSB7XG4gICAgICBjYXNlICdmdWxsJzpcbiAgICAgICAgcmV0dXJuIGFkYXB0ZXIuc2V0QWxsKGVudGl0aWVzLCB7XG4gICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgcGFnaW5hdGlvbjoge1xuICAgICAgICAgICAgLi4uc3RhdGUucGFnaW5hdGlvbixcbiAgICAgICAgICAgIHRvdGFsOiBlbnRpdGllcy5sZW5ndGgsXG4gICAgICAgICAgICBjYWNoZToge1xuICAgICAgICAgICAgICAuLi5zdGF0ZS5wYWdpbmF0aW9uLmNhY2hlLFxuICAgICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgICAgZW5kOiBlbnRpdGllcy5sZW5ndGgsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgY2FzZSAncGFydGlhbCc6IHtcbiAgICAgICAgY29uc3QgaXNQcmVsb2FkTmV4dFBhZ2VzID1cbiAgICAgICAgICBzdGF0ZS5wYWdpbmF0aW9uLmN1cnJlbnRQYWdlICsgMSA9PT0gc3RhdGUucGFnaW5hdGlvbi5yZXF1ZXN0UGFnZTtcblxuICAgICAgICBjb25zdCBzdGFydCA9IHN0YXRlLnBhZ2luYXRpb24uY3VycmVudFBhZ2UgKiBzdGF0ZS5wYWdpbmF0aW9uLnBhZ2VTaXplO1xuICAgICAgICBjb25zdCBuZXdFbnRpdGllcyA9IGlzUHJlbG9hZE5leHRQYWdlc1xuICAgICAgICAgID8gWy4uLmFsbFNlbGVjdG9ycy5zZWxlY3RQYWdlRW50aXRpZXMoc3RhdGUpLCAuLi5lbnRpdGllc11cbiAgICAgICAgICA6IGVudGl0aWVzO1xuICAgICAgICByZXR1cm4gYWRhcHRlci5zZXRBbGwobmV3RW50aXRpZXMsIHtcbiAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICBwYWdpbmF0aW9uOiB7XG4gICAgICAgICAgICAuLi5zdGF0ZS5wYWdpbmF0aW9uLFxuICAgICAgICAgICAgdG90YWwsXG4gICAgICAgICAgICBjYWNoZToge1xuICAgICAgICAgICAgICAuLi5zdGF0ZS5wYWdpbmF0aW9uLmNhY2hlLFxuICAgICAgICAgICAgICBzdGFydCxcbiAgICAgICAgICAgICAgZW5kOiBzdGFydCArIGVudGl0aWVzLmxlbmd0aCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBjYXNlICdncm93JzpcbiAgICAgICAgcmV0dXJuIGFkYXB0ZXIuYWRkTWFueShlbnRpdGllcywge1xuICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgIHBhZ2luYXRpb246IHtcbiAgICAgICAgICAgIC4uLnN0YXRlLnBhZ2luYXRpb24sXG4gICAgICAgICAgICB0b3RhbCxcbiAgICAgICAgICAgIGNhY2hlOiB7XG4gICAgICAgICAgICAgIC4uLnN0YXRlLnBhZ2luYXRpb24uY2FjaGUsXG4gICAgICAgICAgICAgIGVuZDogc3RhdGUuaWRzLmxlbmd0aCArIGVudGl0aWVzLmxlbmd0aCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG4gIHJldHVybiB7IG1lcmdlUGFnaW5hdGVkRW50aXRpZXMgfTtcbn1cbiJdfQ==
