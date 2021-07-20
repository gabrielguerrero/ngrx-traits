import { createReducer, createSelector } from '@ngrx/store';
export function createTraitFactory(f) {
  return f;
}
export function createEntityFeatureFactory(...traits) {
  return (config) => {
    const sortedTraits = sortTraits([...traits]);
    const allConfigs = sortedTraits.reduce((acc, factory) => {
      acc[factory.key] = factory.config;
      return acc;
    }, {});
    const allActions = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b;
      let result =
        (_b =
          (_a =
            factory === null || factory === void 0
              ? void 0
              : factory.actions) === null || _a === void 0
            ? void 0
            : _a.call(factory, {
                actionsGroupKey: config.actionsGroupKey,
                allConfigs,
              })) !== null && _b !== void 0
          ? _b
          : {};
      result = previousResult
        ? Object.assign(Object.assign({}, previousResult), result)
        : result;
      return result;
    }, {});
    const allSelectors = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b;
      let result =
        (_b =
          (_a =
            factory === null || factory === void 0
              ? void 0
              : factory.selectors) === null || _a === void 0
            ? void 0
            : _a.call(factory, {
                previousSelectors: previousResult,
                allConfigs,
              })) !== null && _b !== void 0
          ? _b
          : {};
      result = previousResult
        ? Object.assign(Object.assign({}, previousResult), result)
        : result;
      return result;
    }, {});
    const allMutators = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b;
      let result =
        (_b =
          (_a =
            factory === null || factory === void 0
              ? void 0
              : factory.mutators) === null || _a === void 0
            ? void 0
            : _a.call(factory, {
                allSelectors: allSelectors,
                previousMutators: previousResult,
                allConfigs,
              })) !== null && _b !== void 0
          ? _b
          : {};
      result = previousResult
        ? Object.assign(Object.assign({}, previousResult), result)
        : result;
      return result;
    }, {});
    const initialState = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b, _c;
      const result =
        (_c =
          (_b =
            (_a =
              factory === null || factory === void 0
                ? void 0
                : factory.initialState) === null || _a === void 0
              ? void 0
              : _a.call(factory, {
                  previousInitialState: previousResult,
                  allConfigs,
                })) !== null && _b !== void 0
            ? _b
            : previousResult) !== null && _c !== void 0
          ? _c
          : {};
      return result;
    }, {});
    const reducer = sortedTraits.reduce((previousResult, factory) => {
      var _a;
      const result =
        (_a =
          factory === null || factory === void 0 ? void 0 : factory.reducer) ===
          null || _a === void 0
          ? void 0
          : _a.call(factory, {
              initialState,
              allActions,
              allSelectors,
              allMutators,
              allConfigs,
            });
      return result && previousResult
        ? (state = initialState, action) => {
            const aState = previousResult(state, action);
            return result(aState, action);
          }
        : result !== null && result !== void 0
        ? result
        : previousResult;
    }, undefined);
    const allFeatureSelectors =
      allSelectors &&
      getSelectorsForFeature(config.featureSelector, allSelectors);
    const allEffects = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b;
      let result =
        (_b =
          (_a =
            factory === null || factory === void 0
              ? void 0
              : factory.effects) === null || _a === void 0
            ? void 0
            : _a.call(factory, {
                allActions,
                allSelectors: allFeatureSelectors,
                allConfigs,
              })) !== null && _b !== void 0
          ? _b
          : [];
      result = previousResult ? [...previousResult, ...result] : result;
      return result;
    }, []);
    return {
      actions: allActions,
      selectors: allFeatureSelectors,
      mutators: allMutators,
      initialState,
      reducer:
        reducer !== null && reducer !== void 0
          ? reducer
          : createReducer(initialState),
      effects: allEffects,
    };
  };
}
function sortTraits(traits) {
  var _a;
  const sortedTraits = [];
  for (let i = 0; i < traits.length; i++) {
    const trait = traits[i];
    if (
      !((_a = trait.depends) === null || _a === void 0 ? void 0 : _a.length)
    ) {
      sortedTraits.push(trait);
      continue;
    }
    if (trait.depends.length > 1)
      for (const d of trait.depends) {
        const isTraitPresent = traits.some((tr) => tr.key === d);
        if (isTraitPresent) {
          trait.depends = [d];
          break;
        }
      }
    if (trait.depends.length > 1)
      throw Error('could not find dependencies ' + trait.depends.join(' '));
    const isDependencyAlreadyAdded = sortedTraits.some((tr) => {
      var _a;
      return (
        tr.key ===
        ((_a = trait === null || trait === void 0 ? void 0 : trait.depends) ===
          null || _a === void 0
          ? void 0
          : _a[0])
      );
    });
    if (isDependencyAlreadyAdded) sortedTraits.push(trait);
    else {
      // move trait to the end
      delete traits[i];
      traits.push(trait);
    }
  }
  return sortedTraits;
}
function getSelectorsForFeature(featureSelect, selectors) {
  const ss = {};
  for (const prop in selectors) {
    ss[prop] = createSelector(featureSelect, selectors[prop]);
  }
  return ss;
}
export function setPropertyReducer(sourceReducer, property, propertyReducer) {
  return function reducer(state, action) {
    const sourceState = sourceReducer(state, action);
    return Object.assign(Object.assign({}, sourceState), {
      [property]: propertyReducer(sourceState[property], action),
    });
  };
}
export function setPropertiesReducer(sourceReducer, propertiesReducers) {
  return function reducer(state, action) {
    const newState = Object.assign({}, sourceReducer(state, action));
    for (const property in propertiesReducers) {
      newState[property] = propertiesReducers[property](
        newState[property],
        action
      );
    }
    return newState;
  };
}
export function joinReducers(firstReducer, secondReducer) {
  return function reducer(state, action) {
    const sourceState = firstReducer(state, action);
    return secondReducer(sourceState, action);
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWVudGl0eS1mZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jcmVhdGUtZW50aXR5LWZlYXR1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBY0EsT0FBTyxFQUdMLGFBQWEsRUFDYixjQUFjLEdBRWYsTUFBTSxhQUFhLENBQUM7QUFJckIsTUFBTSxVQUFVLGtCQUFrQixDQVFoQyxDQUEyQztJQUMzQyxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRCxNQUFNLFVBQVUsMEJBQTBCLENBQ3hDLEdBQUcsTUFBUztJQU9aLE9BQU8sQ0FBQyxDQUFDLE1BQXdCLEVBQUUsRUFBRTtRQUNuQyxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFN0MsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FDcEMsQ0FBQyxHQUE2QixFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ3pDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUNsQyxPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUMsRUFDRCxFQUFFLENBQ0gsQ0FBQztRQUVGLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQ3BDLENBQUMsY0FBNEIsRUFBRSxPQUFPLEVBQUUsRUFBRTs7WUFDeEMsSUFBSSxNQUFNLGVBQ1IsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE9BQU8sK0NBQWhCLE9BQU8sRUFBWTtnQkFDakIsZUFBZSxFQUFFLE1BQU0sQ0FBQyxlQUFlO2dCQUN2QyxVQUFVO2FBQ1gsb0NBQUssRUFBRSxDQUFDO1lBQ1gsTUFBTSxHQUFHLGNBQWMsQ0FBQyxDQUFDLGlDQUFNLGNBQWMsR0FBSyxNQUFNLEVBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUNwRSxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDLEVBQ0Qs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QUFDLFFBQVEsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQzFEO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUNELE1BQU0sVUFBVSxvQkFBb0IsQ0FDbEMsYUFBK0QsRUFDL0Qsa0JBRUM7SUFFRCxPQUFPLFNBQVMsT0FBTyxDQUFDLEtBQVksRUFBRSxNQUF1QjtRQUMzRCxNQUFNLFFBQVEscUJBQVEsYUFBYSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBRSxDQUFDO1FBQ3JELEtBQUssTUFBTSxRQUFRLElBQUksa0JBQWtCLEVBQUU7WUFDekMsUUFBUSxDQUFDLFFBQWEsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUNwRCxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQ2xCLE1BQU0sQ0FDUCxDQUFDO1NBQ0g7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FDMUIsWUFBOEQsRUFDOUQsYUFBMkQ7SUFFM0QsT0FBTyxTQUFTLE9BQU8sQ0FBQyxLQUFZLEVBQUUsTUFBdUI7UUFDM0QsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRCxPQUFPLGFBQWEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDNUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbmZpZyxcbiAgRXh0cmFjdEFjdGlvbnNUeXBlLFxuICBFeHRyYWN0TXV0YXRvcnNUeXBlLFxuICBFeHRyYWN0U2VsZWN0b3JzVHlwZSxcbiAgRXh0cmFjdFN0YXRlVHlwZSxcbiAgRmVhdHVyZUZhY3RvcnksXG4gIEZlYXR1cmVTZWxlY3RvcnMsXG4gIEtleWVkQ29uZmlnLFxuICBUcmFpdEFjdGlvbnMsXG4gIFRyYWl0RmFjdG9yeSxcbiAgVHJhaXRTZWxlY3RvcnMsXG4gIFRyYWl0U3RhdGVNdXRhdG9ycyxcbn0gZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIEFjdGlvblR5cGUsXG4gIGNyZWF0ZVJlZHVjZXIsXG4gIGNyZWF0ZVNlbGVjdG9yLFxuICBNZW1vaXplZFNlbGVjdG9yLFxufSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBUcmFpdEVmZmVjdCB9IGZyb20gJy4vdHJhaXQtZWZmZWN0JztcbmltcG9ydCB7IFR5cGUgfSBmcm9tICcuL2xvY2FsLXN0b3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYWl0RmFjdG9yeTxcbiAgU3RhdGUgPSB7fSxcbiAgQSBleHRlbmRzIFRyYWl0QWN0aW9ucyA9IFRyYWl0QWN0aW9ucyxcbiAgUyBleHRlbmRzIFRyYWl0U2VsZWN0b3JzPFN0YXRlPiA9IFRyYWl0U2VsZWN0b3JzPFN0YXRlPixcbiAgTSBleHRlbmRzIFRyYWl0U3RhdGVNdXRhdG9yczxTdGF0ZT4gPSBUcmFpdFN0YXRlTXV0YXRvcnM8U3RhdGU+LFxuICBLRVkgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmcsXG4gIEMgPSB1bmtub3duLFxuICBLQyA9IEtleWVkQ29uZmlnPEtFWSwgQz4sXG4+KGY6IFRyYWl0RmFjdG9yeTxTdGF0ZSwgQSwgUywgTSwgS0VZLCBDLCBLQz4pIHtcbiAgcmV0dXJuIGY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbnRpdHlGZWF0dXJlRmFjdG9yeTxGIGV4dGVuZHMgcmVhZG9ubHkgVHJhaXRGYWN0b3J5W10+KFxuICAuLi50cmFpdHM6IEZcbik6IEZlYXR1cmVGYWN0b3J5PFxuICBFeHRyYWN0U3RhdGVUeXBlPEY+LFxuICBFeHRyYWN0QWN0aW9uc1R5cGU8Rj4sXG4gIEV4dHJhY3RTZWxlY3RvcnNUeXBlPEY+LFxuICBFeHRyYWN0TXV0YXRvcnNUeXBlPEY+XG4+IHtcbiAgcmV0dXJuICgoY29uZmlnOiBDb25maWc8YW55LCBhbnk+KSA9PiB7XG4gICAgY29uc3Qgc29ydGVkVHJhaXRzID0gc29ydFRyYWl0cyhbLi4udHJhaXRzXSk7XG5cbiAgICBjb25zdCBhbGxDb25maWdzID0gc29ydGVkVHJhaXRzLnJlZHVjZShcbiAgICAgIChhY2M6IEtleWVkQ29uZmlnPHN0cmluZywgYW55PiwgZmFjdG9yeSkgPT4ge1xuICAgICAgICBhY2NbZmFjdG9yeS5rZXldID0gZmFjdG9yeS5jb25maWc7XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LFxuICAgICAge30sXG4gICAgKTtcblxuICAgIGNvbnN0IGFsbEFjdGlvbnMgPSBzb3J0ZWRUcmFpdHMucmVkdWNlKFxuICAgICAgKHByZXZpb3VzUmVzdWx0OiBUcmFpdEFjdGlvbnMsIGZhY3RvcnkpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9XG4gICAgICAgICAgZmFjdG9yeT8uYWN0aW9ucz8uKHtcbiAgICAgICAgICAgIGFjdGlvbnNHcm91cEtleTogY29uZmlnLmFjdGlvbnNHcm91cEtleSxcbiAgICAgICAgICAgIGFsbENvbmZpZ3MsXG4gICAgICAgICAgfSkgPz8ge307XG4gICAgICAgIHJlc3VsdCA9IHByZXZpb3VzUmVzdWx0ID8geyAuLi5wcmV2aW91c1Jlc3VsdCwgLi4ucmVzdWx0IH0gOiByZXN1bHQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LFxuICAgICAge30sXG4gICAgKTtcblxuICAgIGNvbnN0IGFsbFNlbGVjdG9ycyA9IHNvcnRlZFRyYWl0cy5yZWR1Y2UoXG4gICAgICAocHJldmlvdXNSZXN1bHQ6IFRyYWl0U2VsZWN0b3JzPGFueT4sIGZhY3RvcnkpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9XG4gICAgICAgICAgZmFjdG9yeT8uc2VsZWN0b3JzPy4oe1xuICAgICAgICAgICAgcHJldmlvdXNTZWxlY3RvcnM6IHByZXZpb3VzUmVzdWx0LFxuICAgICAgICAgICAgYWxsQ29uZmlncyxcbiAgICAgICAgICB9KSA/PyB7fTtcbiAgICAgICAgcmVzdWx0ID0gcHJldmlvdXNSZXN1bHQgPyB7IC4uLnByZXZpb3VzUmVzdWx0LCAuLi5yZXN1bHQgfSA6IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sXG4gICAgICB7fSxcbiAgICApO1xuXG4gICAgY29uc3QgYWxsTXV0YXRvcnMgPSBzb3J0ZWRUcmFpdHMucmVkdWNlKFxuICAgICAgKHByZXZpb3VzUmVzdWx0OiBUcmFpdFN0YXRlTXV0YXRvcnM8YW55PiB8IHVuZGVmaW5lZCwgZmFjdG9yeSkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID1cbiAgICAgICAgICBmYWN0b3J5Py5tdXRhdG9ycz8uKHtcbiAgICAgICAgICAgIGFsbFNlbGVjdG9yczogYWxsU2VsZWN0b3JzLFxuICAgICAgICAgICAgcHJldmlvdXNNdXRhdG9yczogcHJldmlvdXNSZXN1bHQsXG4gICAgICAgICAgICBhbGxDb25maWdzLFxuICAgICAgICAgIH0pID8/IHt9O1xuICAgICAgICByZXN1bHQgPSBwcmV2aW91c1Jlc3VsdCA/IHsgLi4ucHJldmlvdXNSZXN1bHQsIC4uLnJlc3VsdCB9IDogcmVzdWx0O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSxcbiAgICAgIHt9LFxuICAgICk7XG5cbiAgICBjb25zdCBpbml0aWFsU3RhdGUgPSBzb3J0ZWRUcmFpdHMucmVkdWNlKChwcmV2aW91c1Jlc3VsdDogYW55LCBmYWN0b3J5KSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPVxuICAgICAgICBmYWN0b3J5Py5pbml0aWFsU3RhdGU/Lih7XG4gICAgICAgICAgcHJldmlvdXNJbml0aWFsU3RhdGU6IHByZXZpb3VzUmVzdWx0LFxuICAgICAgICAgIGFsbENvbmZpZ3MsXG4gICAgICAgIH0pID8/XG4gICAgICAgIHByZXZpb3VzUmVzdWx0ID8/XG4gICAgICAgIHt9O1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCB7fSk7XG5cbiAgICBjb25zdCByZWR1Y2VyID0gc29ydGVkVHJhaXRzLnJlZHVjZShcbiAgICAgIChcbiAgICAgICAgcHJldmlvdXNSZXN1bHQ6ICgoc3RhdGU6IGFueSwgYWN0aW9uOiBBY3Rpb24pID0+IGFueSkgfCB1bmRlZmluZWQsXG4gICAgICAgIGZhY3RvcnksXG4gICAgICApID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZmFjdG9yeT8ucmVkdWNlcj8uKHtcbiAgICAgICAgICBpbml0aWFsU3RhdGUsXG4gICAgICAgICAgYWxsQWN0aW9ucyxcbiAgICAgICAgICBhbGxTZWxlY3RvcnMsXG4gICAgICAgICAgYWxsTXV0YXRvcnMsXG4gICAgICAgICAgYWxsQ29uZmlncyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgcHJldmlvdXNSZXN1bHRcbiAgICAgICAgICA/IChzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGFTdGF0ZSA9IHByZXZpb3VzUmVzdWx0KHN0YXRlLCBhY3Rpb24pO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0KGFTdGF0ZSwgYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHJlc3VsdCA/PyBwcmV2aW91c1Jlc3VsdDtcbiAgICAgIH0sXG4gICAgICB1bmRlZmluZWQsXG4gICAgKTtcblxuICAgIGNvbnN0IGFsbEZlYXR1cmVTZWxlY3RvcnMgPVxuICAgICAgYWxsU2VsZWN0b3JzICYmXG4gICAgICBnZXRTZWxlY3RvcnNGb3JGZWF0dXJlKGNvbmZpZy5mZWF0dXJlU2VsZWN0b3IsIGFsbFNlbGVjdG9ycyk7XG5cbiAgICBjb25zdCBhbGxFZmZlY3RzID0gc29ydGVkVHJhaXRzLnJlZHVjZShcbiAgICAgIChwcmV2aW91c1Jlc3VsdDogVHlwZTxUcmFpdEVmZmVjdD5bXSB8IHVuZGVmaW5lZCwgZmFjdG9yeSkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID1cbiAgICAgICAgICBmYWN0b3J5Py5lZmZlY3RzPy4oe1xuICAgICAgICAgICAgYWxsQWN0aW9ucyxcbiAgICAgICAgICAgIGFsbFNlbGVjdG9yczogYWxsRmVhdHVyZVNlbGVjdG9ycyxcbiAgICAgICAgICAgIGFsbENvbmZpZ3MsXG4gICAgICAgICAgfSkgPz8gW107XG4gICAgICAgIHJlc3VsdCA9IHByZXZpb3VzUmVzdWx0ID8gWy4uLnByZXZpb3VzUmVzdWx0LCAuLi5yZXN1bHRdIDogcmVzdWx0O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSxcbiAgICAgIFtdLFxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgYWN0aW9uczogYWxsQWN0aW9ucyxcbiAgICAgIHNlbGVjdG9yczogYWxsRmVhdHVyZVNlbGVjdG9ycyxcbiAgICAgIG11dGF0b3JzOiBhbGxNdXRhdG9ycyxcbiAgICAgIGluaXRpYWxTdGF0ZSxcbiAgICAgIHJlZHVjZXI6IHJlZHVjZXIgPz8gY3JlYXRlUmVkdWNlcihpbml0aWFsU3RhdGUpLFxuICAgICAgZWZmZWN0czogYWxsRWZmZWN0cyxcbiAgICB9O1xuICB9KSBhcyBGZWF0dXJlRmFjdG9yeTxcbiAgICBFeHRyYWN0U3RhdGVUeXBlPEY+LFxuICAgIEV4dHJhY3RBY3Rpb25zVHlwZTxGPixcbiAgICBFeHRyYWN0U2VsZWN0b3JzVHlwZTxGPixcbiAgICBFeHRyYWN0TXV0YXRvcnNUeXBlPEY+XG4gID47XG59XG5cbmZ1bmN0aW9uIHNvcnRUcmFpdHMoXG4gIHRyYWl0czogVHJhaXRGYWN0b3J5PGFueSwgYW55LCBhbnksIGFueT5bXSxcbik6IFRyYWl0RmFjdG9yeTxhbnksIGFueSwgYW55LCBhbnk+W10ge1xuICBjb25zdCBzb3J0ZWRUcmFpdHM6IFRyYWl0RmFjdG9yeTxhbnksIGFueSwgYW55LCBhbnk+W10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmFpdHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB0cmFpdCA9IHRyYWl0c1tpXTtcbiAgICBpZiAoIXRyYWl0LmRlcGVuZHM/Lmxlbmd0aCkge1xuICAgICAgc29ydGVkVHJhaXRzLnB1c2godHJhaXQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmICh0cmFpdC5kZXBlbmRzLmxlbmd0aCA+IDEpXG4gICAgICBmb3IgKGNvbnN0IGQgb2YgdHJhaXQuZGVwZW5kcykge1xuICAgICAgICBjb25zdCBpc1RyYWl0UHJlc2VudCA9IHRyYWl0cy5zb21lKCh0cikgPT4gdHIua2V5ID09PSBkKTtcbiAgICAgICAgaWYgKGlzVHJhaXRQcmVzZW50KSB7XG4gICAgICAgICAgdHJhaXQuZGVwZW5kcyA9IFtkXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIGlmICh0cmFpdC5kZXBlbmRzLmxlbmd0aCA+IDEpXG4gICAgICB0aHJvdyBFcnJvcignY291bGQgbm90IGZpbmQgZGVwZW5kZW5jaWVzICcgKyB0cmFpdC5kZXBlbmRzLmpvaW4oJyAnKSk7XG4gICAgY29uc3QgaXNEZXBlbmRlbmN5QWxyZWFkeUFkZGVkID0gc29ydGVkVHJhaXRzLnNvbWUoXG4gICAgICAodHIpID0+IHRyLmtleSA9PT0gdHJhaXQ/LmRlcGVuZHM/LlswXSxcbiAgICApO1xuXG4gICAgaWYgKGlzRGVwZW5kZW5jeUFscmVhZHlBZGRlZCkgc29ydGVkVHJhaXRzLnB1c2godHJhaXQpO1xuICAgIGVsc2Uge1xuICAgICAgLy8gbW92ZSB0cmFpdCB0byB0aGUgZW5kXG4gICAgICBkZWxldGUgdHJhaXRzW2ldO1xuICAgICAgdHJhaXRzLnB1c2godHJhaXQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc29ydGVkVHJhaXRzO1xufVxuXG5mdW5jdGlvbiBnZXRTZWxlY3RvcnNGb3JGZWF0dXJlPFxuICBTdGF0ZSxcbiAgUyBleHRlbmRzIFRyYWl0U2VsZWN0b3JzPFN0YXRlPixcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHlwZXNcbiAgRiBleHRlbmRzIE1lbW9pemVkU2VsZWN0b3I8b2JqZWN0LCBhbnk+LFxuPihmZWF0dXJlU2VsZWN0OiBGLCBzZWxlY3RvcnM6IFMpOiBGZWF0dXJlU2VsZWN0b3JzPFN0YXRlLCBTPiB7XG4gIGNvbnN0IHNzOiB7IFtrZXkgaW4ga2V5b2YgU10/OiBhbnkgfSA9IHt9O1xuICBmb3IgKGNvbnN0IHByb3AgaW4gc2VsZWN0b3JzKSB7XG4gICAgc3NbcHJvcF0gPSBjcmVhdGVTZWxlY3RvcihmZWF0dXJlU2VsZWN0IGFzIGFueSwgc2VsZWN0b3JzW3Byb3BdIGFzIGFueSk7XG4gIH1cbiAgcmV0dXJuIHNzIGFzIEZlYXR1cmVTZWxlY3RvcnM8U3RhdGUsIFM+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcGVydHlSZWR1Y2VyPFN0YXRlLCBQIGV4dGVuZHMga2V5b2YgU3RhdGU+KFxuICBzb3VyY2VSZWR1Y2VyOiAoc3RhdGU6IFN0YXRlLCBhY3Rpb246IEFjdGlvblR5cGU8YW55PikgPT4gU3RhdGUsXG4gIHByb3BlcnR5OiBQLFxuICBwcm9wZXJ0eVJlZHVjZXI6IChzdGF0ZTogU3RhdGVbUF0sIGFjdGlvbjogQWN0aW9uVHlwZTxhbnk+KSA9PiBTdGF0ZVtQXSxcbik6IChzdGF0ZTogU3RhdGUsIGFjdGlvbjogQWN0aW9uVHlwZTxhbnk+KSA9PiBTdGF0ZSB7XG4gIHJldHVybiBmdW5jdGlvbiByZWR1Y2VyKHN0YXRlOiBTdGF0ZSwgYWN0aW9uOiBBY3Rpb25UeXBlPGFueT4pOiBTdGF0ZSB7XG4gICAgY29uc3Qgc291cmNlU3RhdGUgPSBzb3VyY2VSZWR1Y2VyKHN0YXRlLCBhY3Rpb24pO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zb3VyY2VTdGF0ZSxcbiAgICAgIFtwcm9wZXJ0eV06IHByb3BlcnR5UmVkdWNlcihzb3VyY2VTdGF0ZVtwcm9wZXJ0eV0sIGFjdGlvbiksXG4gICAgfTtcbiAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9wZXJ0aWVzUmVkdWNlcjxTdGF0ZSwgUCBleHRlbmRzIGtleW9mIFN0YXRlPihcbiAgc291cmNlUmVkdWNlcjogKHN0YXRlOiBTdGF0ZSwgYWN0aW9uOiBBY3Rpb25UeXBlPGFueT4pID0+IFN0YXRlLFxuICBwcm9wZXJ0aWVzUmVkdWNlcnM6IHtcbiAgICBba2V5IGluIFBdOiAoc3RhdGU6IFN0YXRlW1BdLCBhY3Rpb246IEFjdGlvblR5cGU8YW55PikgPT4gU3RhdGVbUF07XG4gIH0sXG4pOiAoc3RhdGU6IFN0YXRlLCBhY3Rpb246IEFjdGlvblR5cGU8YW55PikgPT4gU3RhdGUge1xuICByZXR1cm4gZnVuY3Rpb24gcmVkdWNlcihzdGF0ZTogU3RhdGUsIGFjdGlvbjogQWN0aW9uVHlwZTxhbnk+KTogU3RhdGUge1xuICAgIGNvbnN0IG5ld1N0YXRlID0geyAuLi5zb3VyY2VSZWR1Y2VyKHN0YXRlLCBhY3Rpb24pIH07XG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBwcm9wZXJ0aWVzUmVkdWNlcnMpIHtcbiAgICAgIG5ld1N0YXRlW3Byb3BlcnR5IGFzIFBdID0gcHJvcGVydGllc1JlZHVjZXJzW3Byb3BlcnR5XShcbiAgICAgICAgbmV3U3RhdGVbcHJvcGVydHldLFxuICAgICAgICBhY3Rpb24sXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3U3RhdGU7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqb2luUmVkdWNlcnM8U3RhdGU+KFxuICBmaXJzdFJlZHVjZXI6IChzdGF0ZTogU3RhdGUsIGFjdGlvbjogQWN0aW9uVHlwZTxhbnk+KSA9PiBTdGF0ZSxcbiAgc2Vjb25kUmVkdWNlcjogKHN0YXRlOiBhbnksIGFjdGlvbjogQWN0aW9uVHlwZTxhbnk+KSA9PiBhbnksXG4pOiAoc3RhdGU6IFN0YXRlLCBhY3Rpb246IEFjdGlvblR5cGU8YW55PikgPT4gU3RhdGUge1xuICByZXR1cm4gZnVuY3Rpb24gcmVkdWNlcihzdGF0ZTogU3RhdGUsIGFjdGlvbjogQWN0aW9uVHlwZTxhbnk+KTogU3RhdGUge1xuICAgIGNvbnN0IHNvdXJjZVN0YXRlID0gZmlyc3RSZWR1Y2VyKHN0YXRlLCBhY3Rpb24pO1xuICAgIHJldHVybiBzZWNvbmRSZWR1Y2VyKHNvdXJjZVN0YXRlLCBhY3Rpb24pO1xuICB9O1xufVxuIl19
