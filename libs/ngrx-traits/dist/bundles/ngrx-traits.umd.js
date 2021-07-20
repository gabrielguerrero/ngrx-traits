(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(
        exports,
        require('@ngrx/store'),
        require('@angular/core'),
        require('@ngrx/effects'),
        require('rxjs/operators')
      )
    : typeof define === 'function' && define.amd
    ? define(
        'ngrx-traits',
        [
          'exports',
          '@ngrx/store',
          '@angular/core',
          '@ngrx/effects',
          'rxjs/operators',
        ],
        factory
      )
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory(
        (global['ngrx-traits'] = {}),
        global.store,
        global.ng.core,
        global.effects,
        global.rxjs.operators
      ));
})(this, function (exports, store, core, effects, operators) {
  'use strict';

  /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
  /* global Reflect, Promise */
  var extendStatics = function (d, b) {
    extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (d, b) {
          d.__proto__ = b;
        }) ||
      function (d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    if (typeof b !== 'function' && b !== null)
      throw new TypeError(
        'Class extends value ' + String(b) + ' is not a constructor or null'
      );
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype =
      b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
  }
  var __assign = function () {
    __assign =
      Object.assign ||
      function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
  function __rest(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  }
  function __decorate(decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }
  function __param(paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  }
  function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(metadataKey, metadataValue);
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  var __createBinding = Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      };
  function __exportStar(m, o) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(o, p))
        __createBinding(o, m, p);
  }
  function __values(o) {
    var s = typeof Symbol === 'function' && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === 'number')
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(
      s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.'
    );
  }
  function __read(o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  }
  /** @deprecated */
  function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
    return ar;
  }
  /** @deprecated */
  function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || from);
  }
  function __await(v) {
    return this instanceof __await ? ((this.v = v), this) : new __await(v);
  }
  function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator)
      throw new TypeError('Symbol.asyncIterator is not defined.');
    var g = generator.apply(thisArg, _arguments || []),
      i,
      q = [];
    return (
      (i = {}),
      verb('next'),
      verb('throw'),
      verb('return'),
      (i[Symbol.asyncIterator] = function () {
        return this;
      }),
      i
    );
    function verb(n) {
      if (g[n])
        i[n] = function (v) {
          return new Promise(function (a, b) {
            q.push([n, v, a, b]) > 1 || resume(n, v);
          });
        };
    }
    function resume(n, v) {
      try {
        step(g[n](v));
      } catch (e) {
        settle(q[0][3], e);
      }
    }
    function step(r) {
      r.value instanceof __await
        ? Promise.resolve(r.value.v).then(fulfill, reject)
        : settle(q[0][2], r);
    }
    function fulfill(value) {
      resume('next', value);
    }
    function reject(value) {
      resume('throw', value);
    }
    function settle(f, v) {
      if ((f(v), q.shift(), q.length)) resume(q[0][0], q[0][1]);
    }
  }
  function __asyncDelegator(o) {
    var i, p;
    return (
      (i = {}),
      verb('next'),
      verb('throw', function (e) {
        throw e;
      }),
      verb('return'),
      (i[Symbol.iterator] = function () {
        return this;
      }),
      i
    );
    function verb(n, f) {
      i[n] = o[n]
        ? function (v) {
            return (p = !p)
              ? { value: __await(o[n](v)), done: n === 'return' }
              : f
              ? f(v)
              : v;
          }
        : f;
    }
  }
  function __asyncValues(o) {
    if (!Symbol.asyncIterator)
      throw new TypeError('Symbol.asyncIterator is not defined.');
    var m = o[Symbol.asyncIterator],
      i;
    return m
      ? m.call(o)
      : ((o =
          typeof __values === 'function' ? __values(o) : o[Symbol.iterator]()),
        (i = {}),
        verb('next'),
        verb('throw'),
        verb('return'),
        (i[Symbol.asyncIterator] = function () {
          return this;
        }),
        i);
    function verb(n) {
      i[n] =
        o[n] &&
        function (v) {
          return new Promise(function (resolve, reject) {
            (v = o[n](v)), settle(resolve, reject, v.done, v.value);
          });
        };
    }
    function settle(resolve, reject, d, v) {
      Promise.resolve(v).then(function (v) {
        resolve({ value: v, done: d });
      }, reject);
    }
  }
  function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  }
  var __setModuleDefault = Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      };
  function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  }
  function __importDefault(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  }
  function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === 'a' && !f)
      throw new TypeError('Private accessor was defined without a getter');
    if (
      typeof state === 'function'
        ? receiver !== state || !f
        : !state.has(receiver)
    )
      throw new TypeError(
        'Cannot read private member from an object whose class did not declare it'
      );
    return kind === 'm'
      ? f
      : kind === 'a'
      ? f.call(receiver)
      : f
      ? f.value
      : state.get(receiver);
  }
  function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === 'm') throw new TypeError('Private method is not writable');
    if (kind === 'a' && !f)
      throw new TypeError('Private accessor was defined without a setter');
    if (
      typeof state === 'function'
        ? receiver !== state || !f
        : !state.has(receiver)
    )
      throw new TypeError(
        'Cannot write private member to an object whose class did not declare it'
      );
    return (
      kind === 'a'
        ? f.call(receiver, value)
        : f
        ? (f.value = value)
        : state.set(receiver, value),
      value
    );
  }

  function createTraitFactory(f) {
    return f;
  }
  function createEntityFeatureFactory() {
    var traits = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      traits[_i] = arguments[_i];
    }
    return function (config) {
      var sortedTraits = sortTraits(__spread(traits));
      var allConfigs = sortedTraits.reduce(function (acc, factory) {
        acc[factory.key] = factory.config;
        return acc;
      }, {});
      var allActions = sortedTraits.reduce(function (previousResult, factory) {
        var _a, _b;
        var result =
          (_b =
            (_a =
              factory === null || factory === void 0
                ? void 0
                : factory.actions) === null || _a === void 0
              ? void 0
              : _a.call(factory, {
                  actionsGroupKey: config.actionsGroupKey,
                  allConfigs: allConfigs,
                })) !== null && _b !== void 0
            ? _b
            : {};
        result = previousResult
          ? Object.assign(Object.assign({}, previousResult), result)
          : result;
        return result;
      }, {});
      var allSelectors = sortedTraits.reduce(function (
        previousResult,
        factory
      ) {
        var _a, _b;
        var result =
          (_b =
            (_a =
              factory === null || factory === void 0
                ? void 0
                : factory.selectors) === null || _a === void 0
              ? void 0
              : _a.call(factory, {
                  previousSelectors: previousResult,
                  allConfigs: allConfigs,
                })) !== null && _b !== void 0
            ? _b
            : {};
        result = previousResult
          ? Object.assign(Object.assign({}, previousResult), result)
          : result;
        return result;
      },
      {});
      var allMutators = sortedTraits.reduce(function (previousResult, factory) {
        var _a, _b;
        var result =
          (_b =
            (_a =
              factory === null || factory === void 0
                ? void 0
                : factory.mutators) === null || _a === void 0
              ? void 0
              : _a.call(factory, {
                  allSelectors: allSelectors,
                  previousMutators: previousResult,
                  allConfigs: allConfigs,
                })) !== null && _b !== void 0
            ? _b
            : {};
        result = previousResult
          ? Object.assign(Object.assign({}, previousResult), result)
          : result;
        return result;
      }, {});
      var initialState = sortedTraits.reduce(function (
        previousResult,
        factory
      ) {
        var _a, _b, _c;
        var result =
          (_c =
            (_b =
              (_a =
                factory === null || factory === void 0
                  ? void 0
                  : factory.initialState) === null || _a === void 0
                ? void 0
                : _a.call(factory, {
                    previousInitialState: previousResult,
                    allConfigs: allConfigs,
                  })) !== null && _b !== void 0
              ? _b
              : previousResult) !== null && _c !== void 0
            ? _c
            : {};
        return result;
      },
      {});
      var reducer = sortedTraits.reduce(function (previousResult, factory) {
        var _a;
        var result =
          (_a =
            factory === null || factory === void 0
              ? void 0
              : factory.reducer) === null || _a === void 0
            ? void 0
            : _a.call(factory, {
                initialState: initialState,
                allActions: allActions,
                allSelectors: allSelectors,
                allMutators: allMutators,
                allConfigs: allConfigs,
              });
        return result && previousResult
          ? function (state, action) {
              if (state === void 0) {
                state = initialState;
              }
              var aState = previousResult(state, action);
              return result(aState, action);
            }
          : result !== null && result !== void 0
          ? result
          : previousResult;
      }, undefined);
      var allFeatureSelectors =
        allSelectors &&
        getSelectorsForFeature(config.featureSelector, allSelectors);
      var allEffects = sortedTraits.reduce(function (previousResult, factory) {
        var _a, _b;
        var result =
          (_b =
            (_a =
              factory === null || factory === void 0
                ? void 0
                : factory.effects) === null || _a === void 0
              ? void 0
              : _a.call(factory, {
                  allActions: allActions,
                  allSelectors: allFeatureSelectors,
                  allConfigs: allConfigs,
                })) !== null && _b !== void 0
            ? _b
            : [];
        result = previousResult ? __spread(previousResult, result) : result;
        return result;
      }, []);
      return {
        actions: allActions,
        selectors: allFeatureSelectors,
        mutators: allMutators,
        initialState: initialState,
        reducer:
          reducer !== null && reducer !== void 0
            ? reducer
            : store.createReducer(initialState),
        effects: allEffects,
      };
    };
  }
  function sortTraits(traits) {
    var _a;
    var sortedTraits = [];
    var _loop_1 = function (i) {
      var e_1, _d;
      var trait = traits[i];
      if (
        !((_a = trait.depends) === null || _a === void 0 ? void 0 : _a.length)
      ) {
        sortedTraits.push(trait);
        return 'continue';
      }
      if (trait.depends.length > 1) {
        var _loop_2 = function (d) {
          var isTraitPresent = traits.some(function (tr) {
            return tr.key === d;
          });
          if (isTraitPresent) {
            trait.depends = [d];
            return 'break';
          }
        };
        try {
          for (
            var _e = ((e_1 = void 0), __values(trait.depends)), _f = _e.next();
            !_f.done;
            _f = _e.next()
          ) {
            var d = _f.value;
            var state_1 = _loop_2(d);
            if (state_1 === 'break') break;
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_f && !_f.done && (_d = _e.return)) _d.call(_e);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      }
      if (trait.depends.length > 1)
        throw Error('could not find dependencies ' + trait.depends.join(' '));
      var isDependencyAlreadyAdded = sortedTraits.some(function (tr) {
        var _a;
        return (
          tr.key ===
          ((_a =
            trait === null || trait === void 0 ? void 0 : trait.depends) ===
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
    };
    for (var i = 0; i < traits.length; i++) {
      _loop_1(i);
    }
    return sortedTraits;
  }
  function getSelectorsForFeature(featureSelect, selectors) {
    var ss = {};
    for (var prop in selectors) {
      ss[prop] = store.createSelector(featureSelect, selectors[prop]);
    }
    return ss;
  }
  function setPropertyReducer(sourceReducer, property, propertyReducer) {
    return function reducer(state, action) {
      var _d;
      var sourceState = sourceReducer(state, action);
      return Object.assign(
        Object.assign({}, sourceState),
        ((_d = {}),
        (_d[property] = propertyReducer(sourceState[property], action)),
        _d)
      );
    };
  }
  function setPropertiesReducer(sourceReducer, propertiesReducers) {
    return function reducer(state, action) {
      var newState = Object.assign({}, sourceReducer(state, action));
      for (var property in propertiesReducers) {
        newState[property] = propertiesReducers[property](
          newState[property],
          action
        );
      }
      return newState;
    };
  }
  function joinReducers(firstReducer, secondReducer) {
    return function reducer(state, action) {
      var sourceState = firstReducer(state, action);
      return secondReducer(sourceState, action);
    };
  }

  var TraitEffect = /** @class */ (function () {
    function TraitEffect(actions$, store) {
      this.actions$ = actions$;
      this.store = store;
      this.name = this.constructor.name;
      this.componentId = '';
    }
    TraitEffect.prototype.ngrxOnIdentifyEffects = function () {
      return this.componentId ? this.name + this.componentId : '';
    };
    TraitEffect.prototype.ngrxOnRunEffects = function (resolvedEffects$) {
      return this.componentId
        ? resolvedEffects$.pipe(
            operators.takeUntil(
              this.actions$.pipe(
                effects.ofType(getDestroyActionName(this.componentId))
              )
            )
          )
        : resolvedEffects$;
    };
    return TraitEffect;
  })();
  TraitEffect.decorators = [{ type: core.Injectable }];
  TraitEffect.ctorParameters = function () {
    return [{ type: effects.Actions }, { type: store.Store }];
  };
  function getDestroyActionName(id) {
    return '[' + id + '] Destroyed';
  }

  var id = 0;
  function uniqueComponentId() {
    return id++;
  }
  function buildLocalTraits(
    injector,
    componentName,
    traitFactory,
    fetchEffectFactory
  ) {
    var _a;
    var reducers = injector.get(store.ReducerManager);
    var effects$1 = injector.get(effects.EffectSources);
    var store$1 = injector.get(store.Store);
    var componentId = componentName + '_' + uniqueComponentId();
    var traits = traitFactory({
      featureSelector: store.createFeatureSelector(componentId),
      actionsGroupKey: '[' + componentId + ']',
    });
    traits.reducer && reducers.addReducer(componentId, traits.reducer);
    var fetchEffect =
      fetchEffectFactory === null || fetchEffectFactory === void 0
        ? void 0
        : fetchEffectFactory(traits.actions, traits.selectors);
    var providers =
      (traits.effects &&
        __spread(
          traits.effects.map(function (e) {
            return { provide: e };
          })
        )) ||
      [];
    if (fetchEffect) {
      providers.push({ provide: fetchEffect });
    }
    var i = core.Injector.create({
      providers: providers,
      parent: injector,
    });
    (_a = traits.effects) === null || _a === void 0
      ? void 0
      : _a.forEach(function (e) {
          var effect = i.get(e);
          effect.componentId = componentId;
          effects$1.addEffects(effect);
        });
    if (fetchEffectFactory) {
      var effect = i.get(fetchEffect);
      effect.componentId = componentId;
      effects$1.addEffects(effect);
    }
    function destroy() {
      store$1.dispatch({ type: getDestroyActionName(componentId) });
      /**
       * A service that extends TraitsLocalStore and other component service are destroyed
       * before the component that depends on them, this causes that any subscriptions
       * to selectors of the TraitsLocalStore could fail because the store state is removed before
       * they are unsubscribe by the onDestroy of the component. Executing reducers.removeReducer
       * inside setTimeout ensures the state is remove after the component onDestroy was called,
       * avoiding the before mentioned possible issues.
       */
      setTimeout(function () {
        return reducers.removeReducer(componentId);
      });
    }
    return Object.assign({ destroy: destroy }, traits);
  }
  var TraitsLocalStore = /** @class */ (function () {
    function TraitsLocalStore(injector) {
      this.injector = injector;
      var config = this.setup();
      this.traits = buildLocalTraits(
        this.injector,
        config.componentName,
        config.traitsFactory,
        config.effectFactory
      );
      this.actions = this.traits.actions;
      this.selectors = this.traits.selectors;
    }
    TraitsLocalStore.prototype.ngOnDestroy = function () {
      this.traits.destroy();
    };
    return TraitsLocalStore;
  })();
  TraitsLocalStore.decorators = [{ type: core.Injectable }];
  TraitsLocalStore.ctorParameters = function () {
    return [{ type: core.Injector }];
  };

  function insertIf(condition, getElement) {
    return condition ? [getElement()] : [];
  }
  function toMap(a) {
    return a.reduce(function (acum, value) {
      acum[value] = true;
      return acum;
    }, {});
  }

  /**
   * Generated bundle index. Do not edit.
   */

  exports.TraitEffect = TraitEffect;
  exports.TraitsLocalStore = TraitsLocalStore;
  exports.buildLocalTraits = buildLocalTraits;
  exports.createEntityFeatureFactory = createEntityFeatureFactory;
  exports.createTraitFactory = createTraitFactory;
  exports.getDestroyActionName = getDestroyActionName;
  exports.insertIf = insertIf;
  exports.joinReducers = joinReducers;
  exports.setPropertiesReducer = setPropertiesReducer;
  exports.setPropertyReducer = setPropertyReducer;
  exports.toMap = toMap;

  Object.defineProperty(exports, '__esModule', { value: true });
});
//# sourceMappingURL=ngrx-traits.umd.js.map
