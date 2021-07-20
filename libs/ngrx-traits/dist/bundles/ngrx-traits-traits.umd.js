(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(
        exports,
        require('@ngrx/store'),
        require('ngrx-traits'),
        require('@ngrx/entity'),
        require('@angular/core'),
        require('rxjs'),
        require('rxjs/operators'),
        require('@ngrx/effects'),
        require('@angular/cdk/coercion')
      )
    : typeof define === 'function' && define.amd
    ? define(
        'ngrx-traits/traits',
        [
          'exports',
          '@ngrx/store',
          'ngrx-traits',
          '@ngrx/entity',
          '@angular/core',
          'rxjs',
          'rxjs/operators',
          '@ngrx/effects',
          '@angular/cdk/coercion',
        ],
        factory
      )
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory(
        ((global['ngrx-traits'] = global['ngrx-traits'] || {}),
        (global['ngrx-traits'].traits = {})),
        global.store,
        global['ngrx-traits'],
        global.entity,
        global.ng.core,
        global.rxjs,
        global.rxjs.operators,
        global.effects,
        global.ng.cdk.coercion
      ));
})(
  this,
  function (
    exports,
    store,
    ngrxTraits,
    entity,
    core,
    rxjs,
    operators,
    effects,
    coercion
  ) {
    'use strict';

    var loadEntitiesTraitKey = 'loadEntities';

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
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
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
        for (
          var i = 0, p = Object.getOwnPropertySymbols(s);
          i < p.length;
          i++
        ) {
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
            r =
              (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
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
            typeof __values === 'function'
              ? __values(o)
              : o[Symbol.iterator]()),
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

    function createLoadEntitiesInitialState(previousInitialState, allConfigs) {
      if (previousInitialState === void 0) {
        previousInitialState = {};
      }
      var traitConfig = allConfigs.loadEntities;
      var adapter = traitConfig.adapter;
      return Object.assign(
        Object.assign(
          Object.assign({}, previousInitialState),
          adapter.getInitialState()
        ),
        { status: undefined }
      );
    }
    function createLoadEntitiesTraitReducer(
      initialState,
      actions,
      allMutators,
      allConfigs
    ) {
      var handleEntitiesMerge = !(allConfigs === null || allConfigs === void 0
        ? void 0
        : allConfigs.pagination);
      return store.createReducer.apply(
        void 0,
        __spread(
          [
            initialState,
            store.on(actions.fetch, function (state) {
              return Object.assign(Object.assign({}, state), {
                status: 'loading',
              });
            }),
            store.on(actions.fetchFail, function (state) {
              return Object.assign(Object.assign({}, state), {
                status: 'fail',
              });
            }),
            store.on(actions.fetchSuccess, function (state) {
              return Object.assign(Object.assign({}, state), {
                status: 'success',
              });
            }),
          ],
          ngrxTraits.insertIf(handleEntitiesMerge, function () {
            return store.on(actions.fetchSuccess, function (state, _a) {
              var entities = _a.entities;
              return allMutators.setAll(entities, Object.assign({}, state));
            });
          })
        )
      );
    }

    function createLoadEntitiesTraitMutators(allConfigs) {
      var _a;
      var adapter =
        (_a =
          allConfigs === null || allConfigs === void 0
            ? void 0
            : allConfigs.loadEntities) === null || _a === void 0
          ? void 0
          : _a.adapter;
      return {
        setAll:
          adapter === null || adapter === void 0 ? void 0 : adapter.setAll,
      };
    }

    function createLoadEntitiesTraitActions(actionsGroupKey) {
      var actions = {
        fetch: store.createAction(actionsGroupKey + ' Fetch Entities'),
        fetchSuccess: store.createAction(
          actionsGroupKey + ' Fetch Entities Success',
          store.props()
        ),
        fetchFail: store.createAction(
          actionsGroupKey + ' Fetch Entities Fail',
          store.props()
        ),
      };
      return actions;
    }

    function isLoading(state) {
      return state.status === 'loading';
    }
    function isSuccess(state) {
      return state.status === 'success';
    }
    function isFail(state) {
      return state.status === 'fail';
    }

    function selectFilter(state) {
      return state.filters;
    }
    function createFilterTraitSelectors() {
      return {
        selectFilter: selectFilter,
      };
    }

    function createLoadEntitiesTraitSelectors(allConfigs) {
      var _a, _b;
      var adapter =
        (_a =
          allConfigs === null || allConfigs === void 0
            ? void 0
            : allConfigs.loadEntities) === null || _a === void 0
          ? void 0
          : _a.adapter;
      var entitySelectors =
        adapter === null || adapter === void 0
          ? void 0
          : adapter.getSelectors();
      var filterFunction =
        (_b =
          allConfigs === null || allConfigs === void 0
            ? void 0
            : allConfigs.filter) === null || _b === void 0
          ? void 0
          : _b.filterFn;
      var selectors = entitySelectors;
      if (filterFunction && entitySelectors) {
        var selectAll = store.createSelector(
          entitySelectors.selectAll,
          selectFilter,
          function (entities, filters) {
            return filters
              ? entities.filter(function (e) {
                  return filterFunction(filters, e);
                })
              : entities;
          }
        );
        selectors = {
          selectAll: selectAll,
          selectEntities: store.createSelector(
            entitySelectors.selectEntities,
            selectFilter,
            function (entities, filters) {
              var result = {};
              for (var id in entities) {
                var e = entities[id];
                if (filterFunction(filters, e)) {
                  result[id] = e;
                }
              }
              return result;
            }
          ),
          selectTotal: store.createSelector(selectAll, function (entities) {
            return entities.length;
          }),
          selectIds: store.createSelector(selectAll, function (entities) {
            return entities.map(function (e) {
              return adapter === null || adapter === void 0
                ? void 0
                : adapter.selectId(e);
            });
          }),
        };
      }
      return Object.assign(Object.assign({}, selectors), {
        isFail: isFail,
        isLoading: isLoading,
        isSuccess: isSuccess,
      });
    }

    function addLoadEntities(traitConfig) {
      var adapter = entity.createEntityAdapter(traitConfig);
      return ngrxTraits.createTraitFactory({
        key: loadEntitiesTraitKey,
        config: Object.assign(Object.assign({}, traitConfig), {
          adapter: adapter,
        }),
        actions: function (_a) {
          var actionsGroupKey = _a.actionsGroupKey;
          return createLoadEntitiesTraitActions(actionsGroupKey);
        },
        selectors: function (_a) {
          var allConfigs = _a.allConfigs;
          return createLoadEntitiesTraitSelectors(allConfigs);
        },
        mutators: function (_a) {
          var allConfigs = _a.allConfigs;
          return createLoadEntitiesTraitMutators(allConfigs);
        },
        initialState: function (_a) {
          var previousInitialState = _a.previousInitialState,
            allConfigs = _a.allConfigs;
          return createLoadEntitiesInitialState(
            previousInitialState,
            allConfigs
          );
        },
        reducer: function (_a) {
          var initialState = _a.initialState,
            allActions = _a.allActions,
            allMutators = _a.allMutators,
            allConfigs = _a.allConfigs;
          return createLoadEntitiesTraitReducer(
            initialState,
            allActions,
            allMutators,
            allConfigs
          );
        },
      });
    }

    var paginationTraitKey = 'pagination';

    function createFilterTraitEffects(allActions, allSelectors, allConfigs) {
      var traitConfig = allConfigs.filter;
      var FilterEffect = /** @class */ (function (_super) {
        __extends(FilterEffect, _super);
        function FilterEffect() {
          var _this = _super.apply(this, __spread(arguments)) || this;
          _this.storeFilter$ = effects.createEffect(function () {
            return function (_a) {
              var _b = _a === void 0 ? {} : _a,
                _c = _b.debounce,
                debounceTime =
                  _c === void 0 ? traitConfig.defaultDebounceTime : _c,
                _d = _b.scheduler,
                scheduler = _d === void 0 ? rxjs.asyncScheduler : _d;
              return _this.actions$.pipe(
                effects.ofType(allActions.filter),
                operators.debounce(function (value) {
                  return (
                    value === null || value === void 0
                      ? void 0
                      : value.forceLoad
                  )
                    ? rxjs.EMPTY
                    : rxjs.timer(debounceTime, scheduler);
                }),
                operators.concatMap(function (payload) {
                  return payload.patch
                    ? _this.store.select(allSelectors.selectFilter).pipe(
                        operators.first(),
                        operators.map(function (storedFilters) {
                          return Object.assign(Object.assign({}, payload), {
                            filters: Object.assign(
                              Object.assign({}, storedFilters),
                              payload === null || payload === void 0
                                ? void 0
                                : payload.filters
                            ),
                          });
                        })
                      )
                    : rxjs.of(payload);
                }),
                operators.distinctUntilChanged(function (previous, current) {
                  return (
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
                  );
                }),
                operators.map(function (action) {
                  return allActions.storeFilter({
                    filters:
                      action === null || action === void 0
                        ? void 0
                        : action.filters,
                    patch:
                      action === null || action === void 0
                        ? void 0
                        : action.patch,
                  });
                })
              );
            };
          });
          _this.fetch$ =
            !(traitConfig === null || traitConfig === void 0
              ? void 0
              : traitConfig.filterFn) &&
            effects.createEffect(function () {
              return _this.actions$.pipe(
                effects.ofType(allActions['storeFilter']),
                operators.concatMap(function () {
                  return (
                    allActions === null || allActions === void 0
                      ? void 0
                      : allActions.loadFirstPage
                  )
                    ? [allActions.clearPagesCache(), allActions.loadFirstPage()]
                    : [allActions.fetch()];
                })
              );
            });
          return _this;
        }
        return FilterEffect;
      })(ngrxTraits.TraitEffect);
      FilterEffect.decorators = [{ type: core.Injectable }];
      return [FilterEffect];
    }

    function createFilterInitialState(previousInitialState, allConfigs) {
      var _a;
      return Object.assign(Object.assign({}, previousInitialState), {
        filters:
          (_a =
            allConfigs === null || allConfigs === void 0
              ? void 0
              : allConfigs.filter) === null || _a === void 0
            ? void 0
            : _a.defaultFilter,
      });
    }
    function createFilterTraitReducer(initialState, allActions, allMutators) {
      return store.createReducer(
        initialState,
        store.on(allActions.storeFilter, function (state, _b) {
          var filters = _b.filters;
          return allMutators.setFilters(filters, state);
        })
      );
    }

    var filterTraitKey = 'filter';

    function createFilterTraitMutators() {
      function setFilters(filters, state) {
        return Object.assign(Object.assign({}, state), { filters: filters });
      }
      return { setFilters: setFilters };
    }

    function createFilterTraitActions(actionsGroupKey) {
      var actions = {
        filter: store.createAction(
          actionsGroupKey + ' filter',
          function (props) {
            return {
              filters:
                props === null || props === void 0 ? void 0 : props.filters,
              forceLoad:
                props === null || props === void 0 ? void 0 : props.forceLoad,
              patch: props === null || props === void 0 ? void 0 : props.patch,
            };
          }
        ),
        storeFilter: store.createAction(
          actionsGroupKey + ' store filter',
          function (props) {
            return {
              filters:
                props === null || props === void 0 ? void 0 : props.filters,
              patch: props === null || props === void 0 ? void 0 : props.patch,
            };
          }
        ),
      };
      return actions;
    }

    function addFilter(_a) {
      var _b = _a === void 0 ? {} : _a,
        _c = _b.defaultDebounceTime,
        defaultDebounceTime = _c === void 0 ? 400 : _c,
        defaultFilter = _b.defaultFilter,
        filterFn = _b.filterFn;
      return ngrxTraits.createTraitFactory({
        key: filterTraitKey,
        depends: [paginationTraitKey, loadEntitiesTraitKey],
        config: {
          defaultDebounceTime: defaultDebounceTime,
          defaultFilter: defaultFilter,
          filterFn: filterFn,
        },
        actions: function (_a) {
          var actionsGroupKey = _a.actionsGroupKey;
          return createFilterTraitActions(actionsGroupKey);
        },
        selectors: function () {
          return createFilterTraitSelectors();
        },
        mutators: function () {
          return createFilterTraitMutators();
        },
        initialState: function (_a) {
          var previousInitialState = _a.previousInitialState,
            allConfigs = _a.allConfigs;
          return createFilterInitialState(previousInitialState, allConfigs);
        },
        reducer: function (_a) {
          var initialState = _a.initialState,
            allActions = _a.allActions,
            allMutators = _a.allMutators;
          return createFilterTraitReducer(
            initialState,
            allActions,
            allMutators
          );
        },
        effects: function (_a) {
          var allActions = _a.allActions,
            allSelectors = _a.allSelectors,
            allConfigs = _a.allConfigs;
          return createFilterTraitEffects(allActions, allSelectors, allConfigs);
        },
      });
    }

    function createPaginationTraitSelectors(previousSelectors, allConfigs) {
      var _a;
      var selectAll = previousSelectors.selectAll,
        isLoading = previousSelectors.isLoading;
      var filterFunction =
        (_a =
          allConfigs === null || allConfigs === void 0
            ? void 0
            : allConfigs.filter) === null || _a === void 0
          ? void 0
          : _a.filterFn;
      function selectPagination(state) {
        return state.pagination;
      }
      var selectPaginationFiltered = filterFunction
        ? store.createSelector(
            selectAll,
            selectPagination,
            function (entities, pagination) {
              return Object.assign(Object.assign({}, pagination), {
                total: entities.length,
                cache: Object.assign(Object.assign({}, pagination.cache), {
                  start: 0,
                  end: entities.length,
                }),
              });
            }
          )
        : selectPagination;
      var selectPageEntities = store.createSelector(
        selectAll,
        selectPaginationFiltered,
        function (entities, pagination, _b) {
          var _c = _b === void 0 ? { page: pagination.currentPage } : _b,
            page = _c.page;
          var startIndex = page * pagination.pageSize - pagination.cache.start;
          var endIndex = startIndex + pagination.pageSize;
          endIndex =
            endIndex < pagination.cache.end ? endIndex : pagination.cache.end;
          return entities.slice(startIndex, endIndex);
        }
      );
      var selectPageInfo = store.createSelector(
        selectPaginationFiltered,
        function (pagination) {
          var pagesCount =
            pagination.total && pagination.total > 0
              ? Math.ceil(pagination.total / pagination.pageSize)
              : undefined;
          return {
            pageIndex: pagination.currentPage,
            total: pagination.total,
            pageSize: pagination.pageSize,
            pagesCount: pagesCount,
            hasPrevious: pagination.currentPage - 1 >= 0,
            hasNext:
              pagination.total && pagination.total > 0
                ? pagination.currentPage + 1 < pagesCount
                : true,
            cacheType: pagination.cache.type,
          };
        }
      );
      var isPageInCache = store.createSelector(
        selectPaginationFiltered,
        function (pagination, _b) {
          var _c = _b === void 0 ? { page: pagination.currentPage } : _b,
            page = _c.page;
          var startIndex = page * pagination.pageSize;
          var endIndex = startIndex + pagination.pageSize - 1;
          endIndex =
            pagination.total && endIndex > pagination.total
              ? pagination.total - 1
              : endIndex;
          return (
            startIndex >= pagination.cache.start &&
            endIndex <= pagination.cache.end
          );
        }
      );
      var selectPage = store.createSelector(
        selectPageEntities,
        selectPageInfo,
        // props look unsued but they are pass to the selectPageEntities
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function (entities, pageInfo, props) {
          if (props === void 0) {
            props = { page: pageInfo.pageIndex };
          }
          return Object.assign({ entities: entities }, pageInfo);
        }
      );
      var selectPagedRequest = store.createSelector(
        selectPagination,
        function (pagination) {
          return {
            startIndex: pagination.pageSize * pagination.requestPage,
            size: pagination.pageSize * pagination.pagesToCache,
            page: pagination.requestPage,
          };
        }
      );
      var isLoadingPage = store.createSelector(
        isLoading,
        selectPagination,
        function (isLoading, pagination) {
          return isLoading && pagination.requestPage === pagination.currentPage;
        }
      );
      return {
        selectPageEntities: selectPageEntities,
        isPageInCache: isPageInCache,
        selectPage: selectPage,
        selectPagedRequest: selectPagedRequest,
        selectPageInfo: selectPageInfo,
        isLoadingPage: isLoadingPage,
      };
    }

    function createPaginationTraitActions(actionsGroupKey) {
      var actions = {
        loadPage: store.createAction(
          actionsGroupKey + ' load page',
          function (_a) {
            var index = _a.index,
              forceLoad = _a.forceLoad;
            return {
              index: index,
              forceLoad: forceLoad,
            };
          }
        ),
        loadPageSuccess: store.createAction(
          actionsGroupKey + ' load\n          page success'
        ),
        loadPageFail: store.createAction(actionsGroupKey + ' load page fail'),
        loadPreviousPage: store.createAction(
          actionsGroupKey + ' load previous page'
        ),
        loadNextPage: store.createAction(actionsGroupKey + ' load next page'),
        loadFirstPage: store.createAction(
          actionsGroupKey + ' load first page',
          function (forceLoad) {
            return { forceLoad: forceLoad };
          }
        ),
        loadLastPage: store.createAction(actionsGroupKey + ' load last page'),
        clearPagesCache: store.createAction(actionsGroupKey + ' clear cache'),
        setRequestPage: store.createAction(
          actionsGroupKey + ' set request page',
          store.props()
        ),
      };
      return actions;
    }

    function createPaginationInitialState(previousInitialState, allConfigs) {
      var _b = allConfigs.pagination,
        currentPage = _b.currentPage,
        pageSize = _b.pageSize,
        cacheType = _b.cacheType,
        pagesToCache = _b.pagesToCache;
      return Object.assign(Object.assign({}, previousInitialState), {
        pagination: {
          pageSize: pageSize,
          currentPage: currentPage,
          requestPage: currentPage,
          pagesToCache: pagesToCache,
          cache: {
            type: cacheType,
            start: 0,
            end: 0,
          },
        },
      });
    }
    function createPaginationTraitReducer(
      initialState,
      allActions,
      allSelectors,
      allMutators,
      allConfigs
    ) {
      var _a;
      function addToCacheTotal(state, add) {
        var _a;
        return Object.assign(Object.assign({}, state), {
          pagination: Object.assign(Object.assign({}, state.pagination), {
            total:
              ((_a = state.pagination.total) !== null && _a !== void 0
                ? _a
                : 0) + add,
          }),
        });
      }
      function clearPagesCache(state) {
        return Object.assign(Object.assign({}, state), {
          entities: {},
          ids: [],
          pagination: Object.assign(Object.assign({}, state.pagination), {
            currentPage: 0,
            total: 0,
            cache: Object.assign(Object.assign({}, state.pagination.cache), {
              start: 0,
              end: 0,
            }),
          }),
        });
      }
      function recalculateTotal(state) {
        var total = allSelectors.selectTotal(state);
        return Object.assign(Object.assign({}, state), {
          status: 'success',
          pagination: Object.assign(Object.assign({}, state.pagination), {
            currentPage: 0,
            total: total,
            cache: Object.assign(Object.assign({}, state.pagination.cache), {
              start: 0,
              end: total,
            }),
          }),
        });
      }
      var filterRemote = !((_a =
        allConfigs === null || allConfigs === void 0
          ? void 0
          : allConfigs.filter) === null || _a === void 0
        ? void 0
        : _a.filterFn);
      return store.createReducer.apply(
        void 0,
        __spread(
          [
            initialState,
            store.on(allActions.loadPage, function (state, _b) {
              var index = _b.index;
              return Object.assign(Object.assign({}, state), {
                pagination: Object.assign(Object.assign({}, state.pagination), {
                  currentPage: index,
                  requestPage: index,
                }),
                status: 'loading',
              });
            }),
            store.on(allActions.setRequestPage, function (state, _b) {
              var index = _b.index;
              return Object.assign(Object.assign({}, state), {
                pagination: Object.assign(Object.assign({}, state.pagination), {
                  requestPage: index,
                }),
                status: 'loading',
              });
            }),
            store.on(allActions.loadPageSuccess, function (state) {
              return Object.assign(Object.assign({}, state), {
                status: 'success',
              });
            }),
            store.on(allActions.loadPageFail, function (state) {
              return Object.assign(Object.assign({}, state), {
                status: 'fail',
              });
            }),
            store.on(allActions.clearPagesCache, function (state) {
              return clearPagesCache(state);
            }),
            store.on(allActions.fetchSuccess, function (state, _b) {
              var entities = _b.entities,
                total = _b.total;
              return allMutators.mergePaginatedEntities(
                entities,
                total,
                Object.assign(Object.assign({}, state), { status: 'success' })
              );
            }),
          ],
          ngrxTraits.insertIf(allActions.add, function () {
            return store.on(allActions.add, function (state, _b) {
              var entities = _b.entities;
              return addToCacheTotal(state, entities.length);
            });
          }),
          ngrxTraits.insertIf(allActions.remove, function () {
            return store.on(allActions.remove, function (state, _b) {
              var keys = _b.keys;
              return addToCacheTotal(state, -keys.length);
            });
          }),
          ngrxTraits.insertIf(filterRemote && allActions.filter, function () {
            return store.on(allActions.filter, function (state) {
              return recalculateTotal(state);
            });
          }),
          ngrxTraits.insertIf(allActions.removeAll, function () {
            return store.on(allActions.removeAll, function (state) {
              return clearPagesCache(state);
            });
          })
        )
      );
    }

    function createPaginationTraitEffects(allActions, allSelectors) {
      var PaginationEffect = /** @class */ (function (_super) {
        __extends(PaginationEffect, _super);
        function PaginationEffect() {
          var _this = _super.apply(this, __spread(arguments)) || this;
          _this.loadPage$ = effects.createEffect(function () {
            return _this.actions$.pipe(
              effects.ofType(allActions.loadPage),
              effects.concatLatestFrom(function () {
                return _this.store.select(allSelectors.isPageInCache);
              }),
              operators.map(function (_a) {
                var _b = __read(_a, 2),
                  forceLoad = _b[0].forceLoad,
                  isInCache = _b[1];
                return !forceLoad && isInCache
                  ? allActions.loadPageSuccess()
                  : allActions.fetch();
              })
            );
          });
          _this.preloadNextPage$ = effects.createEffect(function () {
            return _this.actions$.pipe(
              effects.ofType(allActions.loadPageSuccess),
              operators.concatMapTo(
                _this.store
                  .select(allSelectors.selectPageInfo)
                  .pipe(operators.first())
              ),
              operators.filter(function (pageInfo) {
                return (
                  !!pageInfo.total &&
                  pageInfo.hasNext &&
                  pageInfo.cacheType !== 'full'
                );
              }),
              operators.concatMap(function (pageInfo) {
                return _this.store
                  .select(allSelectors.isPageInCache, {
                    page: pageInfo.pageIndex + 1,
                  })
                  .pipe(
                    operators.first(),
                    operators.map(function (isInCache) {
                      return (!isInCache && pageInfo) || undefined;
                    })
                  );
              }),
              operators.filter(function (pageInfo) {
                return !!pageInfo;
              }),
              operators.concatMap(function (pageInfo) {
                return [
                  allActions.setRequestPage({ index: pageInfo.pageIndex + 1 }),
                  allActions.fetch(),
                ];
              })
            );
          });
          _this.loadFirstPage$ = effects.createEffect(function () {
            return _this.actions$.pipe(
              effects.ofType(allActions.loadFirstPage),
              operators.map(function () {
                return allActions.loadPage({ index: 0 });
              })
            );
          });
          _this.loadPreviousPage$ = effects.createEffect(function () {
            return _this.actions$.pipe(
              effects.ofType(allActions.loadPreviousPage),
              operators.concatMapTo(
                _this.store
                  .select(allSelectors.selectPageInfo)
                  .pipe(operators.first())
              ),
              operators.map(function (page) {
                return page.hasPrevious
                  ? allActions.loadPage({ index: page.pageIndex - 1 })
                  : allActions.loadPageFail();
              })
            );
          });
          _this.loadNextPage$ = effects.createEffect(function () {
            return _this.actions$.pipe(
              effects.ofType(allActions.loadNextPage),
              operators.concatMapTo(
                _this.store
                  .select(allSelectors.selectPageInfo)
                  .pipe(operators.first())
              ),
              operators.map(function (page) {
                return page.hasNext
                  ? allActions.loadPage({ index: page.pageIndex + 1 })
                  : allActions.loadPageFail();
              })
            );
          });
          _this.loadLastPage$ = effects.createEffect(function () {
            return _this.actions$.pipe(
              effects.ofType(allActions.loadLastPage),
              operators.concatMapTo(
                _this.store
                  .select(allSelectors.selectPageInfo)
                  .pipe(operators.first())
              ),
              operators.map(function (page) {
                return page.hasNext && page.pagesCount
                  ? allActions.loadPage({ index: page.pagesCount - 1 })
                  : allActions.loadPageFail();
              })
            );
          });
          return _this;
        }
        return PaginationEffect;
      })(ngrxTraits.TraitEffect);
      PaginationEffect.decorators = [{ type: core.Injectable }];
      return [PaginationEffect];
    }

    function createPaginationTraitMutators(allSelectors, allConfigs) {
      var adapter = allConfigs.loadEntities.adapter;
      function mergePaginatedEntities(entities, total, state) {
        if (total === void 0) {
          total = undefined;
        }
        var cacheType = state.pagination.cache.type;
        switch (cacheType) {
          case 'full':
            return adapter.setAll(
              entities,
              Object.assign(Object.assign({}, state), {
                pagination: Object.assign(Object.assign({}, state.pagination), {
                  total: entities.length,
                  cache: Object.assign(
                    Object.assign({}, state.pagination.cache),
                    { start: 0, end: entities.length }
                  ),
                }),
              })
            );
          case 'partial': {
            var isPreloadNextPages =
              state.pagination.currentPage + 1 === state.pagination.requestPage;
            var start =
              state.pagination.currentPage * state.pagination.pageSize;
            var newEntities = isPreloadNextPages
              ? __spread(allSelectors.selectPageEntities(state), entities)
              : entities;
            return adapter.setAll(
              newEntities,
              Object.assign(Object.assign({}, state), {
                pagination: Object.assign(Object.assign({}, state.pagination), {
                  total: total,
                  cache: Object.assign(
                    Object.assign({}, state.pagination.cache),
                    { start: start, end: start + entities.length }
                  ),
                }),
              })
            );
          }
          case 'grow':
            return adapter.addMany(
              entities,
              Object.assign(Object.assign({}, state), {
                pagination: Object.assign(Object.assign({}, state.pagination), {
                  total: total,
                  cache: Object.assign(
                    Object.assign({}, state.pagination.cache),
                    { end: state.ids.length + entities.length }
                  ),
                }),
              })
            );
        }
        return state;
      }
      return { mergePaginatedEntities: mergePaginatedEntities };
    }

    function addPagination(_a) {
      var _b = _a === void 0 ? {} : _a,
        _c = _b.cacheType,
        cacheType = _c === void 0 ? 'full' : _c,
        _d = _b.pageSize,
        pageSize = _d === void 0 ? 20 : _d,
        _e = _b.currentPage,
        currentPage = _e === void 0 ? 0 : _e,
        _f = _b.pagesToCache,
        pagesToCache = _f === void 0 ? 3 : _f;
      return ngrxTraits.createTraitFactory({
        key: paginationTraitKey,
        depends: [loadEntitiesTraitKey],
        config: {
          cacheType: cacheType,
          pageSize: pageSize,
          currentPage: currentPage,
          pagesToCache: pagesToCache,
        },
        actions: function (_a) {
          var actionsGroupKey = _a.actionsGroupKey;
          return createPaginationTraitActions(actionsGroupKey);
        },
        selectors: function (_a) {
          var previousSelectors = _a.previousSelectors,
            allConfigs = _a.allConfigs;
          return createPaginationTraitSelectors(previousSelectors, allConfigs);
        },
        mutators: function (_a) {
          var allSelectors = _a.allSelectors,
            allConfigs = _a.allConfigs;
          return createPaginationTraitMutators(allSelectors, allConfigs);
        },
        initialState: function (_a) {
          var previousInitialState = _a.previousInitialState,
            allConfigs = _a.allConfigs;
          return createPaginationInitialState(previousInitialState, allConfigs);
        },
        reducer: function (_a) {
          var initialState = _a.initialState,
            allActions = _a.allActions,
            allSelectors = _a.allSelectors,
            allMutators = _a.allMutators,
            allConfigs = _a.allConfigs;
          return createPaginationTraitReducer(
            initialState,
            allActions,
            allSelectors,
            allMutators,
            allConfigs
          );
        },
        effects: function (_a) {
          var allActions = _a.allActions,
            allSelectors = _a.allSelectors;
          return createPaginationTraitEffects(allActions, allSelectors);
        },
      });
    }

    function createMultiSelectionTraitActions(actionsGroupKey) {
      return {
        multiSelect: store.createAction(
          actionsGroupKey + ' Select',
          store.props()
        ),
        multiDeselect: store.createAction(
          actionsGroupKey + ' Deselect',
          store.props()
        ),
        multiToggleSelect: store.createAction(
          actionsGroupKey + ' Toggle Select',
          store.props()
        ),
        toggleSelectAll: store.createAction(
          actionsGroupKey + ' Toggle Select All'
        ),
        multiClearSelection: store.createAction(
          actionsGroupKey + ' Clear Selection'
        ),
      };
    }

    function multiDeselect(id, state) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      var _a = state.selectedIds,
        _b = id,
        _value = _a[_b],
        selectedIds = __rest(_a, [typeof _b === 'symbol' ? _b : _b + '']);
      return Object.assign(Object.assign({}, state), {
        selectedIds: selectedIds,
      });
    }
    function multiSelect(id, state) {
      var _c;
      return Object.assign(Object.assign({}, state), {
        selectedIds: Object.assign(
          Object.assign({}, state.selectedIds),
          ((_c = {}), (_c[id] = true), _c)
        ),
      });
    }
    function multiToggleSelect(id, state) {
      var selected = state.selectedIds[id];
      if (selected) {
        return multiDeselect(id, state);
      } else {
        return multiSelect(id, state);
      }
    }
    function multiClearSelection(state) {
      return Object.assign(Object.assign({}, state), { selectedIds: {} });
    }
    function selectTotalSelected(state) {
      return Object.keys(state.selectedIds).length;
    }

    function createMultiSelectionTraitSelectors(previousSelectors) {
      var selectEntities = previousSelectors.selectEntities,
        selectTotal = previousSelectors.selectTotal;
      function selectIdsSelected(state) {
        return state.selectedIds;
      }
      var selectAllIdsSelected = store.createSelector(
        selectIdsSelected,
        function (ids) {
          return Object.keys(ids);
        }
      );
      var selectEntitiesSelected = store.createSelector(
        selectAllIdsSelected,
        selectEntities,
        function (selectedIds, entities) {
          return selectedIds.reduce(function (acum, id) {
            acum[id] = entities[id];
            return acum;
          }, {});
        }
      );
      var selectAllSelected = store.createSelector(
        selectAllIdsSelected,
        selectEntities,
        function (selectedIds, entities) {
          return selectedIds.map(function (id) {
            return entities[id];
          });
        }
      );
      var isAllSelected = store.createSelector(
        function (state) {
          return selectTotal(state);
        },
        selectTotalSelected,
        function (total, totalSelected) {
          return totalSelected === total
            ? 'all'
            : totalSelected === 0
            ? 'none'
            : 'some';
        }
      );
      return {
        selectIdsSelected: selectIdsSelected,
        selectAllIdsSelected: selectAllIdsSelected,
        selectEntitiesSelected: selectEntitiesSelected,
        selectAllSelected: selectAllSelected,
        selectTotalSelected: selectTotalSelected,
        isAllSelected: isAllSelected,
      };
    }

    function createMultiSelectionInitialState(previousInitialState) {
      return Object.assign(Object.assign({}, previousInitialState), {
        selectedIds: {},
      });
    }
    function createMultiSelectionTraitReducer(
      initialState,
      allActions,
      allMutators,
      allConfigs
    ) {
      var _a, _b;
      var adapter = allConfigs.loadEntities.adapter;
      var sortRemote =
        (_a = allConfigs.sort) === null || _a === void 0 ? void 0 : _a.remote;
      var paginationCacheType =
        (_b = allConfigs.pagination) === null || _b === void 0
          ? void 0
          : _b.cacheType;
      function updateSelectedIdsChanged(state, updates) {
        var changedIds = updates.reduce(function (acc, updated) {
          var id = adapter.selectId(updated.changes);
          if (
            id &&
            id !== updated.id &&
            state.selectedIds[updated.id] != null
          ) {
            acc.push(updated);
            return acc;
          }
          return acc;
        }, []);
        if (changedIds.length) {
          var selectedIds_1 = Object.assign({}, state.selectedIds);
          changedIds.forEach(function (updated) {
            var id = adapter.selectId(updated.changes);
            var value = selectedIds_1[updated.id];
            delete selectedIds_1[updated.id];
            selectedIds_1[id] = value;
          });
          return Object.assign(Object.assign({}, state), {
            selectedIds: selectedIds_1,
          });
        }
        return state;
      }
      return store.createReducer.apply(
        void 0,
        __spread(
          [
            initialState,
            store.on(allActions.multiSelect, function (state, _c) {
              var id = _c.id;
              return allMutators.multiSelect(id, state);
            }),
            store.on(allActions.multiDeselect, function (state, _c) {
              var id = _c.id;
              return allMutators.multiDeselect(id, state);
            }),
            store.on(allActions.multiToggleSelect, function (state, _c) {
              var id = _c.id;
              return allMutators.multiToggleSelect(id, state);
            }),
            store.on(allActions.toggleSelectAll, function (state) {
              return allMutators.toggleSelectAll(state);
            }),
          ],
          ngrxTraits.insertIf(allActions.remove, function () {
            return store.on(allActions.remove, function (state, _c) {
              var keys = _c.keys;
              var selectedIds = Object.assign({}, state.selectedIds);
              keys.forEach(function (v) {
                delete selectedIds[v];
              });
              return Object.assign(Object.assign({}, state), {
                selectedIds: selectedIds,
              });
            });
          }),
          ngrxTraits.insertIf(allActions.update, function () {
            return store.on(allActions.update, function (state, _c) {
              var updates = _c.updates;
              return updateSelectedIdsChanged(state, updates);
            });
          }),
          [
            store.on(allActions.multiClearSelection, function (state) {
              return allMutators.multiClearSelection(state);
            }),
          ],
          ngrxTraits.insertIf(allActions.removeAll, function () {
            return store.on(allActions.removeAll, function (state) {
              return allMutators.multiClearSelection(state);
            });
          }),
          ngrxTraits.insertIf(sortRemote, function () {
            return store.on(allActions.sort, function (state) {
              return allMutators.multiClearSelection(state);
            });
          }),
          ngrxTraits.insertIf(allActions.filter, function () {
            return store.on(allActions.filter, function (state) {
              return allMutators.multiClearSelection(state);
            });
          }),
          ngrxTraits.insertIf(!allActions.loadPageSuccess, function () {
            return store.on(allActions.fetchSuccess, function (state) {
              return allMutators.multiClearSelection(state);
            });
          }),
          ngrxTraits.insertIf(
            allActions.loadPageSuccess && paginationCacheType === 'partial',
            function () {
              return store.on(allActions.loadPageSuccess, function (state) {
                return allMutators.multiClearSelection(state);
              });
            }
          )
        )
      );
    }

    function createMultiSelectionTraitMutators(_a) {
      var isAllSelected = _a.isAllSelected;
      function toggleSelectAll(state) {
        var allSelected = isAllSelected(state);
        if (allSelected === 'all') {
          return Object.assign(Object.assign({}, state), { selectedIds: {} });
        } else {
          return Object.assign(Object.assign({}, state), {
            selectedIds: ngrxTraits.toMap(state.ids),
          });
        }
      }
      return {
        multiDeselect: multiDeselect,
        multiSelect: multiSelect,
        multiToggleSelect: multiToggleSelect,
        toggleSelectAll: toggleSelectAll,
        multiClearSelection: multiClearSelection,
      };
    }

    function addMultiSelection() {
      return ngrxTraits.createTraitFactory({
        key: 'multiSelection',
        depends: [loadEntitiesTraitKey],
        actions: function (_a) {
          var actionsGroupKey = _a.actionsGroupKey;
          return createMultiSelectionTraitActions(actionsGroupKey);
        },
        selectors: function (_a) {
          var previousSelectors = _a.previousSelectors;
          return createMultiSelectionTraitSelectors(previousSelectors);
        },
        initialState: function (_a) {
          var previousInitialState = _a.previousInitialState;
          return createMultiSelectionInitialState(previousInitialState);
        },
        mutators: function (_a) {
          var allSelectors = _a.allSelectors;
          return createMultiSelectionTraitMutators(allSelectors);
        },
        reducer: function (_a) {
          var initialState = _a.initialState,
            allActions = _a.allActions,
            allMutators = _a.allMutators,
            allConfigs = _a.allConfigs;
          return createMultiSelectionTraitReducer(
            initialState,
            allActions,
            allMutators,
            allConfigs
          );
        },
      });
    }

    function createSingleSelectionTraitActions(actionsGroupKey) {
      return {
        select: store.createAction(actionsGroupKey + ' Select', store.props()),
        deselect: store.createAction(actionsGroupKey + ' Deselect'),
        toggleSelect: store.createAction(
          actionsGroupKey + ' Toggle Select',
          store.props()
        ),
      };
    }

    function createSingleSelectionTraitSelectors() {
      function selectIdSelected(state) {
        return state.selectedId;
      }
      function selectEntitySelected(state) {
        return (
          (state.selectedId && state.entities[state.selectedId]) || undefined
        );
      }
      return {
        selectIdSelected: selectIdSelected,
        selectEntitySelected: selectEntitySelected,
      };
    }

    function createSingleSelectionInitialState(
      previousInitialState,
      allConfigs
    ) {
      var _a;
      var selectedId =
        (_a = allConfigs.singleSelection) === null || _a === void 0
          ? void 0
          : _a.selectedId;
      return Object.assign(Object.assign({}, previousInitialState), {
        selectedId: selectedId,
      });
    }
    function createSingleSelectionTraitReducer(
      initialState,
      allActions,
      allMutators,
      allConfigs
    ) {
      var _a, _b;
      var adapter = allConfigs.loadEntities.adapter;
      var sortRemote =
        (_a = allConfigs.sort) === null || _a === void 0 ? void 0 : _a.remote;
      var paginationCacheType =
        (_b = allConfigs.pagination) === null || _b === void 0
          ? void 0
          : _b.cacheType;
      return store.createReducer.apply(
        void 0,
        __spread(
          [
            initialState,
            store.on(allActions.select, function (state, _c) {
              var id = _c.id;
              return allMutators.select(id, state);
            }),
            store.on(allActions.deselect, function (state) {
              return allMutators.deselect(state);
            }),
            store.on(allActions.toggleSelect, function (state, _c) {
              var id = _c.id;
              return allMutators.toggleSelect(id, state);
            }),
          ],
          ngrxTraits.insertIf(allActions.removeAll, function () {
            return store.on(allActions.removeAll, function (state) {
              return allMutators.deselect(state);
            });
          }),
          ngrxTraits.insertIf(sortRemote, function () {
            return store.on(allActions.sort, function (state) {
              return allMutators.deselect(state);
            });
          }),
          ngrxTraits.insertIf(allActions.filter, function () {
            return store.on(allActions.filter, function (state) {
              return allMutators.deselect(state);
            });
          }),
          ngrxTraits.insertIf(!allActions.loadPageSuccess, function () {
            return store.on(allActions.fetchSuccess, function (state) {
              return allMutators.deselect(state);
            });
          }),
          ngrxTraits.insertIf(
            allActions.loadPageSuccess && paginationCacheType === 'partial',
            function () {
              return store.on(allActions.loadPageSuccess, function (state) {
                return allMutators.deselect(state);
              });
            }
          ),
          ngrxTraits.insertIf(allActions.remove, function () {
            return store.on(allActions.remove, function (state, _c) {
              var keys = _c.keys;
              var shouldDeselect = keys.some(function (v) {
                return v === state.selectedId;
              });
              return shouldDeselect
                ? Object.assign(Object.assign({}, state), {
                    selectedId: undefined,
                  })
                : state;
            });
          }),
          ngrxTraits.insertIf(allActions.update, function () {
            return store.on(allActions.update, function (state, _c) {
              var updates = _c.updates;
              var change = updates.find(function (updated) {
                var id = adapter.selectId(updated.changes);
                return (
                  id && id !== updated.id && state.selectedId === updated.id
                );
              });
              return change
                ? Object.assign(Object.assign({}, state), {
                    selectedId: adapter.selectId(change.changes),
                  })
                : state;
            });
          })
        )
      );
    }

    function createSingleSelectionTraitMutators() {
      function select(id, state) {
        return Object.assign(Object.assign({}, state), { selectedId: id });
      }
      function deselect(state) {
        return Object.assign(Object.assign({}, state), {
          selectedId: undefined,
        });
      }
      function toggleSelect(id, state) {
        return Object.assign(Object.assign({}, state), {
          selectedId: state.selectedId === id ? undefined : id,
        });
      }
      return {
        select: select,
        deselect: deselect,
        toggleSelect: toggleSelect,
      };
    }

    function addSingleSelection(config) {
      return ngrxTraits.createTraitFactory({
        key: 'singleSelection',
        depends: [loadEntitiesTraitKey],
        config: config,
        actions: function (_a) {
          var actionsGroupKey = _a.actionsGroupKey;
          return createSingleSelectionTraitActions(actionsGroupKey);
        },
        selectors: function () {
          return createSingleSelectionTraitSelectors();
        },
        mutators: function () {
          return createSingleSelectionTraitMutators();
        },
        initialState: function (_a) {
          var previousInitialState = _a.previousInitialState,
            allConfigs = _a.allConfigs;
          return createSingleSelectionInitialState(
            previousInitialState,
            allConfigs
          );
        },
        reducer: function (_a) {
          var initialState = _a.initialState,
            allActions = _a.allActions,
            allMutators = _a.allMutators,
            allConfigs = _a.allConfigs;
          return createSingleSelectionTraitReducer(
            initialState,
            allActions,
            allMutators,
            allConfigs
          );
        },
      });
    }

    var singleSelectionTraitKey = 'singleSelection';

    exports.ChangeType = void 0;
    (function (ChangeType) {
      ChangeType['CREATED'] = 'c';
      ChangeType['UPDATED'] = 'u';
      ChangeType['DELETED'] = 'd';
    })(exports.ChangeType || (exports.ChangeType = {}));
    var crudTraitKey = 'crud';

    function createCrudTraitActions(actionsGroupKey) {
      return {
        add: store.createAction(actionsGroupKey + ' Add', function () {
          var entities = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            entities[_i] = arguments[_i];
          }
          return {
            entities: entities,
          };
        }),
        remove: store.createAction(actionsGroupKey + ' Remove', function () {
          var keys = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
          }
          return {
            keys: keys,
          };
        }),
        update: store.createAction(actionsGroupKey + ' Update', function () {
          var updates = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            updates[_i] = arguments[_i];
          }
          return {
            updates: updates,
          };
        }),
        upsert: store.createAction(actionsGroupKey + ' Upsert', function () {
          var entities = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            entities[_i] = arguments[_i];
          }
          return {
            entities: entities,
          };
        }),
        removeAll: store.createAction(
          actionsGroupKey + ' Remove All',
          function (predicate) {
            return { predicate: predicate };
          }
        ),
        clearChanges: store.createAction(actionsGroupKey + ' Clear Changes'),
      };
    }

    function createCrudTraitSelectors(previousSelectors) {
      function selectChanges(state) {
        return state.changes;
      }
      function selectFilteredChanges(state) {
        var cache = {};
        return state.changes.reduce(function (acc, value) {
          var changes = cache[value.id];
          if (!changes) {
            cache[value.id] = [value.changeType];
            acc.push(value);
            return acc;
          }
          if (value.changeType === exports.ChangeType.UPDATED) {
            return acc;
          }
          if (
            value.changeType === exports.ChangeType.DELETED &&
            changes.includes(exports.ChangeType.CREATED)
          ) {
            delete cache[value.id];
            return acc.filter(function (v) {
              return v.id !== value.id;
            });
          }
          if (value.changeType === exports.ChangeType.DELETED) {
            delete cache[value.id];
            var newAcc = acc.filter(function (v) {
              return v.id !== value.id;
            });
            newAcc.push(value);
            return newAcc;
          }
          return acc;
        }, []);
      }
      var selectEntities = previousSelectors.selectEntities;
      var selectAllChanges = store.createSelector(
        function (state) {
          return selectEntities(state);
        },
        selectChanges,
        function (entities, changed, _b) {
          var type = _b.type;
          if (type)
            return changed
              .filter(function (c) {
                return c.changeType === type;
              })
              .map(function (change) {
                var _a;
                return {
                  changeType: change.changeType,
                  entity:
                    (_a = entities[change.id]) !== null && _a !== void 0
                      ? _a
                      : {
                          id: change.id,
                        },
                };
              });
          var map = changed.map(function (change) {
            var _a;
            return {
              changeType: change.changeType,
              entity:
                (_a = entities[change.id]) !== null && _a !== void 0
                  ? _a
                  : {
                      id: change.id,
                    },
            };
          });
          return map;
        }
      );
      var selectAllFilteredChanges = store.createSelector(
        selectFilteredChanges,
        function (state) {
          return selectEntities(state);
        },
        function (changes, entities) {
          return changes.map(function (c) {
            var _a;
            return {
              entity:
                (_a = entities[c.id]) !== null && _a !== void 0
                  ? _a
                  : { id: c.id },
              changeType: c.changeType,
            };
          });
        }
      );
      return {
        selectAllChanges: selectAllChanges,
        selectAllFilteredChanges: selectAllFilteredChanges,
        selectChanges: selectChanges,
        selectFilteredChanges: selectFilteredChanges,
      };
    }

    function createCrudInitialState(previousInitialState) {
      return Object.assign(Object.assign({}, previousInitialState), {
        changes: [],
      });
    }
    function createCrudTraitReducer(
      initialState,
      allActions,
      allMutators,
      allConfigs
    ) {
      var _a, _b, _c;
      var sortRemote =
        (_a = allConfigs.sort) === null || _a === void 0 ? void 0 : _a.remote;
      var filterRemote =
        allConfigs.filter &&
        !((_b = allConfigs.filter) === null || _b === void 0
          ? void 0
          : _b.filterFn);
      var paginationCacheType =
        (_c = allConfigs.pagination) === null || _c === void 0
          ? void 0
          : _c.cacheType;
      return store.createReducer.apply(
        void 0,
        __spread(
          [
            initialState,
            store.on(allActions.add, function (state, _d) {
              var entities = _d.entities;
              return allMutators.add(entities, state);
            }),
            store.on(allActions.update, function (state, _d) {
              var updates = _d.updates;
              return allMutators.update(updates, state);
            }),
            store.on(allActions.upsert, function (state, _d) {
              var entities = _d.entities;
              return allMutators.upsert(entities, state);
            }),
            store.on(allActions.remove, function (state, _d) {
              var keys = _d.keys;
              return allMutators.remove(keys, state);
            }),
            store.on(allActions.removeAll, function (state, _d) {
              var predicate = _d.predicate;
              return predicate
                ? allMutators.remove(predicate, state)
                : allMutators.removeAll(state);
            }),
            store.on(allActions.clearChanges, function (state) {
              return allMutators.clearChanges(state);
            }),
          ],
          ngrxTraits.insertIf(sortRemote, function () {
            return store.on(allActions.sort, function (state) {
              return allMutators.clearChanges(state);
            });
          }),
          ngrxTraits.insertIf(filterRemote, function () {
            return store.on(allActions.filter, function (state) {
              return allMutators.clearChanges(state);
            });
          }),
          ngrxTraits.insertIf(!allActions.loadPageSuccess, function () {
            return store.on(allActions.fetchSuccess, function (state) {
              return allMutators.clearChanges(state);
            });
          }),
          ngrxTraits.insertIf(
            allActions.loadPageSuccess && paginationCacheType === 'partial',
            function () {
              return store.on(allActions.loadPageSuccess, function (state) {
                return allMutators.clearChanges(state);
              });
            }
          )
        )
      );
    }

    function createCrudTraitMutators(allConfigs) {
      var storeChanges = (allConfigs.crud || {}).storeChanges;
      var adapter = allConfigs.loadEntities.adapter;
      function generateChangeEntry(entity, changeType, customId) {
        return {
          id:
            customId !== null && customId !== void 0
              ? customId
              : adapter.selectId(entity),
          changeType: changeType,
          entityChanges: (storeChanges && entity) || undefined,
        };
      }
      function add(entities, state, addFirst) {
        if (addFirst === void 0) {
          addFirst = false;
        }
        var changes = __spread(
          state.changes,
          entities.map(function (entity) {
            return generateChangeEntry(entity, exports.ChangeType.CREATED);
          })
        );
        if (!addFirst)
          return adapter.addMany(
            entities,
            Object.assign(Object.assign({}, state), { changes: changes })
          );
        var newIds = entities.map(function (e) {
          return adapter.selectId(e);
        });
        var newEntities = Object.assign({}, state.entities);
        entities.forEach(function (e) {
          var id = adapter.selectId(e);
          newEntities[id] = e;
        });
        return Object.assign(Object.assign({}, state), {
          ids: __spread(newIds, state.ids),
          entities: newEntities,
          changes: changes,
        });
      }
      function upsert(entities, state) {
        var oldChanges = __spread(state.changes);
        var existingIds = adapter.getSelectors().selectIds(state);
        var _b = __read(
            entities.reduce(
              function (_b, entity) {
                var _c = __read(_b, 2),
                  a = _c[0],
                  u = _c[1];
                return existingIds.indexOf(adapter.selectId(entity)) !== -1
                  ? [a, __spread(u, [entity])]
                  : [__spread(a, [entity]), u];
              },
              [new Array(), new Array()]
            ),
            2
          ),
          additions = _b[0],
          updates = _b[1];
        return adapter.upsertMany(
          entities,
          Object.assign(Object.assign({}, state), {
            changes: __spread(
              oldChanges,
              additions.map(function (entity) {
                return generateChangeEntry(entity, exports.ChangeType.CREATED);
              }),
              updates.map(function (entity) {
                return generateChangeEntry(entity, exports.ChangeType.UPDATED);
              })
            ),
          })
        );
      }
      function remove(keysOrPredicate, state) {
        if (typeof keysOrPredicate === 'function') {
          return adapter.removeMany(
            keysOrPredicate,
            Object.assign(Object.assign({}, state), {
              changes: __spread(
                state.changes,
                state.ids.map(function (id) {
                  return {
                    id: id,
                    changeType: exports.ChangeType.DELETED,
                  };
                })
              ),
            })
          );
        }
        return adapter.removeMany(
          keysOrPredicate,
          Object.assign(Object.assign({}, state), {
            changes: __spread(
              state.changes,
              keysOrPredicate.map(function (key) {
                return {
                  id: key,
                  changeType: exports.ChangeType.DELETED,
                };
              })
            ),
          })
        );
      }
      function removeAll(state) {
        return adapter.removeAll(
          Object.assign(Object.assign({}, state), {
            changes: __spread(
              state.changes,
              state.ids.map(function (id) {
                return {
                  id: id,
                  changeType: exports.ChangeType.DELETED,
                };
              })
            ),
          })
        );
      }
      function clearChanges(state) {
        return Object.assign(Object.assign({}, state), { changes: [] });
      }
      function update(updates, state) {
        var oldChanges = __spread(state.changes);
        updates.forEach(function (updated) {
          var id = adapter.selectId(updated.changes);
          if (id && id !== updated.id) {
            // if the id changes update the id of pold changes
            var index = oldChanges.findIndex(function (v) {
              return v.id === updated.id;
            });
            var oldChange = oldChanges[index];
            oldChanges[index] = Object.assign(Object.assign({}, oldChange), {
              id: id,
            });
          }
        });
        return adapter.updateMany(
          updates,
          Object.assign(Object.assign({}, state), {
            changes: __spread(
              oldChanges,
              updates.map(function (updated) {
                var _a;
                return {
                  id:
                    (_a = adapter.selectId(updated.changes)) !== null &&
                    _a !== void 0
                      ? _a
                      : updated.id,
                  changeType: exports.ChangeType.UPDATED,
                  entityChanges: (storeChanges && updated.changes) || undefined,
                };
              })
            ),
          })
        );
      }
      return {
        add: add,
        remove: remove,
        update: update,
        removeAll: removeAll,
        clearChanges: clearChanges,
        upsert: upsert,
      };
    }

    function addCrudEntities(_a) {
      var _b = _a === void 0 ? {} : _a,
        _c = _b.storeChanges,
        storeChanges = _c === void 0 ? false : _c;
      return ngrxTraits.createTraitFactory({
        key: crudTraitKey,
        depends: [loadEntitiesTraitKey],
        config: { storeChanges: storeChanges },
        actions: function (_a) {
          var actionsGroupKey = _a.actionsGroupKey;
          return createCrudTraitActions(actionsGroupKey);
        },
        selectors: function (_a) {
          var previousSelectors = _a.previousSelectors;
          return createCrudTraitSelectors(previousSelectors);
        },
        mutators: function (_a) {
          var allConfigs = _a.allConfigs;
          return createCrudTraitMutators(allConfigs);
        },
        initialState: function (_a) {
          var previousInitialState = _a.previousInitialState;
          return createCrudInitialState(previousInitialState);
        },
        reducer: function (_a) {
          var initialState = _a.initialState,
            allActions = _a.allActions,
            allMutators = _a.allMutators,
            allConfigs = _a.allConfigs;
          return createCrudTraitReducer(
            initialState,
            allActions,
            allMutators,
            allConfigs
          );
        },
      });
    }

    var sortTraitKey = 'sort';

    var MAX_SAFE_INTEGER = 9007199254740991;
    function sortingDataAccessor(data, sortHeaderId) {
      var value = data[sortHeaderId];
      if (coercion._isNumberValue(value)) {
        var numberValue = Number(value);
        // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
        // leave them as strings. For more info: https://goo.gl/y5vbSg
        return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
      }
      return value;
    }
    /**
     * Gets a sorted copy of the data array based on the state of the Sort.
     * @param data The array of data that should be sorted.
     * @param sort The connected MatSort that holds the current sort state.
     */
    function sortData(data, sort) {
      var active = sort.active;
      var direction = sort.direction;
      if (!active || direction === '') {
        return data;
      }
      return data.sort(function (a, b) {
        var valueA = sortingDataAccessor(a, active);
        var valueB = sortingDataAccessor(b, active);
        // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
        // one value exists while the other doesn't. In this case, existing value should come last.
        // This avoids inconsistent results when comparing values to undefined/null.
        // If neither value exists, return 0 (equal).
        var comparatorResult = 0;
        if (valueA != null && valueB != null) {
          // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
          if (typeof valueA === 'string' || typeof valueB === 'string') {
            // if either values are a string, then force both to be strings before localCompare
            comparatorResult = valueA
              .toString()
              .localeCompare(valueB.toString());
          } else {
            if (valueA > valueB) {
              comparatorResult = 1;
            } else if (valueA < valueB) {
              comparatorResult = -1;
            }
          }
        } else if (valueA != null) {
          comparatorResult = 1;
        } else if (valueB != null) {
          comparatorResult = -1;
        }
        return comparatorResult * (direction === 'asc' ? 1 : -1);
      });
    }

    function createSortTraitMutators(_a, allConfigs) {
      var selectAll = _a.selectAll;
      function sortEntities(_a, state) {
        var active = _a.active,
          direction = _a.direction;
        var adapter = allConfigs.loadEntities.adapter;
        var entities = selectAll(state);
        var sortedIds = sortData(entities, {
          active: active,
          direction: direction,
        }).map(function (v) {
          return adapter.selectId(v);
        });
        return Object.assign(Object.assign({}, state), {
          ids: sortedIds,
          sort: Object.assign(Object.assign({}, state.sort), {
            current: { active: active, direction: direction },
          }),
        });
      }
      return {
        sortEntities: sortEntities,
      };
    }

    function createSortInitialState(previousInitialState, allConfigs) {
      var defaultSort = allConfigs.sort.defaultSort;
      return Object.assign(Object.assign({}, previousInitialState), {
        sort: {
          current: defaultSort,
          default: defaultSort,
        },
      });
    }
    function createSortTraitReducer(
      initialState,
      allActions,
      allMutators,
      allConfigs
    ) {
      var remote = allConfigs.sort.remote;
      return store.createReducer(
        initialState,
        store.on(allActions.sort, function (state, _d) {
          var active = _d.active,
            direction = _d.direction;
          return !remote
            ? allMutators.sortEntities(
                { active: active, direction: direction },
                state
              )
            : Object.assign(Object.assign({}, state), {
                sort: Object.assign(Object.assign({}, state.sort), {
                  current: { active: active, direction: direction },
                }),
              });
        }),
        store.on(allActions.resetSort, function (state) {
          var _a, _b, _c;
          return (
            (_a = state.sort) === null || _a === void 0 ? void 0 : _a.default
          )
            ? !remote
              ? allMutators.sortEntities(
                  (_b = state.sort) === null || _b === void 0
                    ? void 0
                    : _b.default,
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

    function createSortTraitSelectors() {
      function selectSort(state) {
        var _a;
        return (_a = state.sort) === null || _a === void 0
          ? void 0
          : _a.current;
      }
      return {
        selectSort: selectSort,
      };
    }

    function createSortTraitEffect(allActions, allConfigs) {
      var remote = allConfigs.sort.remote;
      var SortEffect = /** @class */ (function (_super) {
        __extends(SortEffect, _super);
        function SortEffect() {
          var _this = _super.apply(this, __spread(arguments)) || this;
          _this.remoteSort$ = effects.createEffect(function () {
            return _this.actions$.pipe(
              effects.ofType(allActions.sort, allActions.resetSort),
              operators.concatMap(function () {
                return allActions.loadFirstPage
                  ? [allActions.clearPagesCache(), allActions.loadFirstPage()]
                  : [allActions.fetch()];
              })
            );
          });
          return _this;
        }
        return SortEffect;
      })(ngrxTraits.TraitEffect);
      SortEffect.decorators = [{ type: core.Injectable }];
      return remote ? [SortEffect] : [];
    }

    function createSortTraitActions(actionsGroupKey) {
      return {
        sort: store.createAction(actionsGroupKey + ' sort', store.props()),
        resetSort: store.createAction(actionsGroupKey + ' default sort'),
      };
    }

    function addSort(_a) {
      var _b = _a === void 0 ? {} : _a,
        _c = _b.remote,
        remote = _c === void 0 ? false : _c,
        defaultSort = _b.defaultSort;
      return ngrxTraits.createTraitFactory({
        key: sortTraitKey,
        depends: [loadEntitiesTraitKey],
        config: { remote: remote, defaultSort: defaultSort },
        actions: function (_a) {
          var actionsGroupKey = _a.actionsGroupKey;
          return createSortTraitActions(actionsGroupKey);
        },
        selectors: function () {
          return createSortTraitSelectors();
        },
        mutators: function (_a) {
          var allSelectors = _a.allSelectors,
            allConfigs = _a.allConfigs;
          return createSortTraitMutators(allSelectors, allConfigs);
        },
        initialState: function (_a) {
          var previousInitialState = _a.previousInitialState,
            allConfigs = _a.allConfigs;
          return createSortInitialState(previousInitialState, allConfigs);
        },
        reducer: function (_a) {
          var initialState = _a.initialState,
            allActions = _a.allActions,
            allMutators = _a.allMutators,
            allConfigs = _a.allConfigs;
          return createSortTraitReducer(
            initialState,
            allActions,
            allMutators,
            allConfigs
          );
        },
        effects: function (_a) {
          var allActions = _a.allActions,
            allConfigs = _a.allConfigs;
          return createSortTraitEffect(allActions, allConfigs);
        },
      });
    }

    function addReset(traitConfig) {
      if (traitConfig === void 0) {
        traitConfig = {};
      }
      return ngrxTraits.createTraitFactory({
        key: 'reset',
        config: traitConfig,
        actions: function (_b) {
          var actionsGroupKey = _b.actionsGroupKey;
          return {
            reset: store.createAction(actionsGroupKey + ' Reset State'),
          };
        },
        reducer: function (_b) {
          var allActions = _b.allActions,
            initialState = _b.initialState;
          return store.createReducer(
            initialState,
            store.on(allActions.reset, function () {
              return initialState;
            })
          );
        },
        effects: function (_b) {
          var allActions = _b.allActions;
          var _a;
          var ResetEffect = /** @class */ (function (_super) {
            __extends(ResetEffect, _super);
            function ResetEffect() {
              var _this = this;
              var _a;
              _this = _super.apply(this, __spread(arguments)) || this;
              _this.externalReset$ =
                ((_a =
                  traitConfig === null || traitConfig === void 0
                    ? void 0
                    : traitConfig.resetOn) === null || _a === void 0
                  ? void 0
                  : _a.length) &&
                effects.createEffect(function () {
                  return _this.actions$.pipe(
                    effects.ofType.apply(
                      void 0,
                      __spread(
                        traitConfig === null || traitConfig === void 0
                          ? void 0
                          : traitConfig.resetOn
                      )
                    ),
                    operators.mapTo(allActions.reset())
                  );
                });
              return _this;
            }
            return ResetEffect;
          })(ngrxTraits.TraitEffect);
          ResetEffect.decorators = [{ type: core.Injectable }];
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
    function addAsyncAction(_a) {
      var name = _a.name,
        actionProps = _a.actionProps,
        actionSuccessProps = _a.actionSuccessProps,
        actionFailProps = _a.actionFailProps;
      var nameAsSentence = camelCaseToSentence(name);
      var internalActions;
      return ngrxTraits.createTraitFactory({
        key: name + '-call',
        config: {
          name: name,
          actionProps: actionProps,
          actionSuccessProps: actionSuccessProps,
          actionFailProps: actionFailProps,
        },
        actions: function (_a) {
          var _b;
          var actionsGroupKey = _a.actionsGroupKey;
          internalActions = {
            request: actionProps
              ? store.createAction(
                  actionsGroupKey + ' ' + nameAsSentence,
                  actionProps
                )
              : store.createAction(actionsGroupKey + ' ' + nameAsSentence),
            requestSuccess: actionSuccessProps
              ? store.createAction(
                  actionsGroupKey + ' ' + nameAsSentence + ' Success',
                  actionSuccessProps
                )
              : store.createAction(
                  actionsGroupKey + ' ' + nameAsSentence + ' Success'
                ),
            requestFail: actionFailProps
              ? store.createAction(
                  actionsGroupKey + ' ' + nameAsSentence + ' Failure',
                  actionFailProps
                )
              : store.createAction(
                  actionsGroupKey + ' ' + nameAsSentence + ' Failure'
                ),
          };
          if (name) {
            return (
              (_b = {}),
              (_b['' + name] = internalActions.request),
              (_b[name + 'Success'] = internalActions.requestSuccess),
              (_b[name + 'Fail'] = internalActions.requestFail),
              _b
            );
          }
          return internalActions;
        },
        selectors: function () {
          var _a;
          function isLoadingEntity(state) {
            return state[name + 'Status'] === 'loading';
          }
          function isSuccessEntity(state) {
            return state[name + 'Status'] === 'success';
          }
          function isFailEntity(state) {
            return state[name + 'Status'] === 'fail';
          }
          var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
          return (
            (_a = {}),
            (_a['isLoading' + capitalizedName] = isLoadingEntity),
            (_a['isSuccess' + capitalizedName] = isSuccessEntity),
            (_a['isFail' + capitalizedName] = isFailEntity),
            _a
          );
        },
        initialState: function (_a) {
          var previousInitialState = _a.previousInitialState;
          return previousInitialState;
        },
        reducer: function (_a) {
          var initialState = _a.initialState;
          return store.createReducer(
            initialState,
            store.on(internalActions.request, function (state) {
              var _a;
              return Object.assign(
                Object.assign({}, state),
                ((_a = {}), (_a[name + 'Status'] = 'loading'), _a)
              );
            }),
            store.on(internalActions.requestFail, function (state) {
              var _a;
              return Object.assign(
                Object.assign({}, state),
                ((_a = {}), (_a[name + 'Status'] = 'fail'), _a)
              );
            }),
            store.on(internalActions.requestSuccess, function (state) {
              var _a;
              return Object.assign(
                Object.assign({}, state),
                ((_a = {}), (_a[name + 'Status'] = 'success'), _a)
              );
            })
          );
        },
      });
    }
    function camelCaseToSentence(text) {
      var result = text.replace(/([A-Z])/g, ' $1');
      return result.charAt(0).toUpperCase() + result.slice(1);
    }

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
    function addLoadEntity(_a) {
      var entityName = _a.entityName,
        actionProps = _a.actionProps,
        actionSuccessProps = _a.actionSuccessProps,
        actionFailProps = _a.actionFailProps;
      var capitalizedName =
        entityName.charAt(0).toUpperCase() + entityName.slice(1);
      return [
        addAsyncAction({
          name: 'load' + capitalizedName,
          actionProps: actionProps,
          actionSuccessProps: actionSuccessProps,
          actionFailProps: actionFailProps,
        }),
        ngrxTraits.createTraitFactory({
          key: 'load' + capitalizedName,
          config: {
            entityName: entityName,
            actionProps: actionProps,
            actionSuccessProps: actionSuccessProps,
            actionFailProps: actionFailProps,
          },
          selectors: function () {
            var _a;
            function selectEntity(state) {
              return state['' + entityName];
            }
            return (
              (_a = {}), (_a['select' + capitalizedName] = selectEntity), _a
            );
          },
          initialState: function (_a) {
            var previousInitialState = _a.previousInitialState;
            return previousInitialState;
          },
          reducer: function (_a) {
            var initialState = _a.initialState,
              allActions = _a.allActions;
            return store.createReducer(
              initialState,
              store.on(
                allActions['load' + capitalizedName + 'Success'],
                function (state, action) {
                  var _a;
                  return Object.assign(
                    Object.assign({}, state),
                    ((_a = {}), (_a[entityName] = action[entityName]), _a)
                  );
                }
              )
            );
          },
        }),
      ];
    }

    /**
     * Generated bundle index. Do not edit.
     */

    exports.addAsyncAction = addAsyncAction;
    exports.addCrudEntities = addCrudEntities;
    exports.addFilter = addFilter;
    exports.addLoadEntities = addLoadEntities;
    exports.addLoadEntity = addLoadEntity;
    exports.addMultiSelection = addMultiSelection;
    exports.addPagination = addPagination;
    exports.addReset = addReset;
    exports.addSingleSelection = addSingleSelection;
    exports.addSort = addSort;
    exports.crudTraitKey = crudTraitKey;
    exports.filterTraitKey = filterTraitKey;
    exports.loadEntitiesTraitKey = loadEntitiesTraitKey;
    exports.multiClearSelection = multiClearSelection;
    exports.multiDeselect = multiDeselect;
    exports.multiSelect = multiSelect;
    exports.multiToggleSelect = multiToggleSelect;
    exports.paginationTraitKey = paginationTraitKey;
    exports.selectTotalSelected = selectTotalSelected;
    exports.singleSelectionTraitKey = singleSelectionTraitKey;
    exports.sortData = sortData;
    exports.sortTraitKey = sortTraitKey;

    Object.defineProperty(exports, '__esModule', { value: true });
  }
);
//# sourceMappingURL=ngrx-traits-traits.umd.js.map
