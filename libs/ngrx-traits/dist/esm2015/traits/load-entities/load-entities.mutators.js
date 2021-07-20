export function createLoadEntitiesTraitMutators(allConfigs) {
  var _a;
  const adapter =
    (_a =
      allConfigs === null || allConfigs === void 0
        ? void 0
        : allConfigs.loadEntities) === null || _a === void 0
      ? void 0
      : _a.adapter;
  return {
    setAll: adapter === null || adapter === void 0 ? void 0 : adapter.setAll,
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZC1lbnRpdGllcy5tdXRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RyYWl0cy9zcmMvbG9hZC1lbnRpdGllcy9sb2FkLWVudGl0aWVzLm11dGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE1BQU0sVUFBVSwrQkFBK0IsQ0FDN0MsVUFBbUU7O0lBRW5FLE1BQU0sT0FBTyxTQUFHLFVBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxZQUFZLDBDQUFFLE9BQU8sQ0FBQztJQUVsRCxPQUFPO1FBQ0wsTUFBTSxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxNQUFNO0tBQ1EsQ0FBQztBQUNwQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgTG9hZEVudGl0aWVzS2V5ZWRDb25maWcsXG4gIExvYWRFbnRpdGllc011dGF0b3JzLFxufSBmcm9tICcuL2xvYWQtZW50aXRpZXMubW9kZWwnO1xuaW1wb3J0IHsgUGFnaW5hdGlvbktleWVkQ29uZmlnIH0gZnJvbSAnLi4vcGFnaW5hdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2FkRW50aXRpZXNUcmFpdE11dGF0b3JzPEVudGl0eT4oXG4gIGFsbENvbmZpZ3M6IExvYWRFbnRpdGllc0tleWVkQ29uZmlnPEVudGl0eT4gJiBQYWdpbmF0aW9uS2V5ZWRDb25maWcsXG4pIHtcbiAgY29uc3QgYWRhcHRlciA9IGFsbENvbmZpZ3M/LmxvYWRFbnRpdGllcz8uYWRhcHRlcjtcblxuICByZXR1cm4ge1xuICAgIHNldEFsbDogYWRhcHRlcj8uc2V0QWxsLFxuICB9IGFzIExvYWRFbnRpdGllc011dGF0b3JzPEVudGl0eT47XG59XG4iXX0=
