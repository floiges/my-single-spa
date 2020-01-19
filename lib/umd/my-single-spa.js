(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.mySingleSpa = {}));
}(this, (function (exports) { 'use strict';

  var mySingleSpa = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get setBootstrapMaxTime () { return setBootstrapMaxTime; },
    get setMountMaxTime () { return setMountMaxTime; },
    get setUnmountMaxTime () { return setUnmountMaxTime; },
    get setUnloadMaxTime () { return setUnloadMaxTime; },
    get registerApplication () { return registerApplication; },
    get getAppNames () { return getAppNames; },
    get getAppStatus () { return getAppStatus; },
    get getRawApps () { return getRawApps; },
    get start () { return start; },
    get mountSystemService () { return mountSystemService; },
    get getSystemService () { return getSystemService; },
    get NOT_LOADED () { return NOT_LOADED; },
    get LOAD_RESOURCE_CODE () { return LOAD_RESOURCE_CODE; },
    get NOT_BOOTSTRAPPED () { return NOT_BOOTSTRAPPED; },
    get BOOTSTRAPPING () { return BOOTSTRAPPING; },
    get NOT_MOUNTED () { return NOT_MOUNTED; },
    get MOUNTED () { return MOUNTED; },
    get UNMOUNTING () { return UNMOUNTING; },
    get LOAD_ERROR () { return LOAD_ERROR; },
    get SKIP_BECAUSE_BROKEN () { return SKIP_BECAUSE_BROKEN; }
  });

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var DEFAULT_TIMEOUTS = {
    bootstrap: {
      // 超时毫秒数
      milliseconds: 3000,
      // 当超时时，是否 reject
      rejectWhenTimeout: false
    },
    mount: {
      // 超时毫秒数
      milliseconds: 3000,
      // 当超时时，是否 reject
      rejectWhenTimeout: false
    },
    unmount: {
      // 超时毫秒数
      milliseconds: 3000,
      // 当超时时，是否 reject
      rejectWhenTimeout: false
    },
    unload: {
      // 超时毫秒数
      milliseconds: 3000,
      // 当超时时，是否 reject
      rejectWhenTimeout: false
    }
  };
  function setBootstrapMaxTime(milliseconds) {
    var rejectWhenTimeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (typeof milliseconds !== 'number' || milliseconds <= 0) {
      throw new Error("".concat(type, " max time must be a positive integer number of milliseconds"));
    }

    DEFAULT_TIMEOUTS.bootstrap = {
      milliseconds: milliseconds,
      rejectWhenTimeout: rejectWhenTimeout
    };
  }
  function setMountMaxTime(milliseconds) {
    var rejectWhenTimeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (typeof milliseconds !== 'number' || milliseconds <= 0) {
      throw new Error("".concat(type, " max time must be a positive integer number of milliseconds"));
    }

    DEFAULT_TIMEOUTS.mount = {
      milliseconds: milliseconds,
      rejectWhenTimeout: rejectWhenTimeout
    };
  }
  function setUnmountMaxTime(milliseconds) {
    var rejectWhenTimeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (typeof milliseconds !== 'number' || milliseconds <= 0) {
      throw new Error("".concat(type, " max time must be a positive integer number of milliseconds"));
    }

    DEFAULT_TIMEOUTS.unmount = {
      milliseconds: milliseconds,
      rejectWhenTimeout: rejectWhenTimeout
    };
  }
  function setUnloadMaxTime(milliseconds) {
    var rejectWhenTimeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (typeof milliseconds !== 'number' || milliseconds <= 0) {
      throw new Error("".concat(type, " max time must be a positive integer number of milliseconds"));
    }

    DEFAULT_TIMEOUTS.unload = {
      milliseconds: milliseconds,
      rejectWhenTimeout: rejectWhenTimeout
    };
  }
  function ensureAppTimeouts() {
    var timeouts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return _objectSpread2({}, DEFAULT_TIMEOUTS, {}, timeouts);
  }
  /**
   * 给每个app的生命周期函数增加超时的处理
   * promise： 经过 flattenFnArray 处理过的生命周期函数
   */

  function reasonableTime(promise, description, timeouts) {
    return new Promise(function (resolve, reject) {
      var finised = false;
      promise.then(function (data) {
        finised = true;
        resolve(data);
      }).catch(function (e) {
        finised = true;
        reject(e);
      });
      setTimeout(function () {
        return maybeTimeout();
      }, timeouts.milliseconds);

      function maybeTimeout() {
        if (finised) {
          return;
        }

        var error = "".concat(description, " did not resolve or reject for ").concat(timeouts.milliseconds, " milliseconds");

        if (timeouts.rejectWhenTimeout) {
          reject(new Error(error));
        } else {
          console.error(error);
        }
      }
    });
  }

  // app还未加载，默认状态

  var NOT_LOADED = 'NOT_LOADED'; // 加载 app 代码中

  var LOAD_RESOURCE_CODE = 'LOAD_RESOURCE_CODE'; // 加载成功，但未启动
  // app模块加载完成，但是还未启动（未执行app的bootstrap生命周期函数）

  var NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'; // 启动中
  // 执行app的bootstrap生命周期函数中（只执行一次）

  var BOOTSTRAPPING = 'BOOTSTRAPPING'; // 启动成功，但未挂载
  // app的bootstrap或unmount生命周期函数执行成功，等待执行mount生命周期函数（可多次执行）

  var NOT_MOUNTED = 'NOT_MOUNTED'; // 挂载中
  // 执行app的mount生命周期函数中

  var MOUNTING = 'MOUNTING'; // 挂载成功
  // app的mount或update(service独有)生命周期函数执行成功，意味着此app已挂载成功，可执行Vue的$mount()或ReactDOM的render()

  var MOUNTED = 'MOUNTED'; // 卸载中
  // 	app的unmount生命周期函数执行中，意味着此app正在卸载中，可执行Vue的$destory()或ReactDOM的unmountComponentAtNode()

  var UNMOUNTING = 'UNMOUNTING'; // 加载时参数校验未通过，或非致命错误
  // app变更状态时遇见错误，如果app的状态变为了SKIP_BECAUSE_BROKEN，那么app就会blocking，不会往下个状态变更

  var SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN'; // 加载时遇到致命错误
  // 加载错误，意味着app将无法被使用

  var LOAD_ERROR = 'LOAD_ERROR'; // 更新 service 中
  // service更新中，只有service才会有此状态，app则没有

  var UPDATING = 'UPDATING';
  function notSkipped(app) {
    return app.status !== SKIP_BECAUSE_BROKEN;
  }
  function withoutLoadError(app) {
    return app.status !== LOAD_ERROR;
  }
  function isLoaded(app) {
    return app.status !== NOT_LOADED && app.status !== LOAD_ERROR && app.status !== LOAD_RESOURCE_CODE;
  }
  function isntLoaded(app) {
    return !isLoaded(app);
  }
  function isActive(app) {
    return app.status === MOUNTED;
  }
  function isntActive(app) {
    return !isActive(app);
  }
  function shouldBeActive(app) {
    try {
      return app.activityWhen(window.location);
    } catch (e) {
      app.status = SKIP_BECAUSE_BROKEN;
      throw e;
    }
  }
  function shouldntBeActive(app) {
    try {
      return !app.activityWhen(window.location);
    } catch (e) {
      app.status = SKIP_BECAUSE_BROKEN;
      throw e;
    }
  }

  /**
   * 启动 app
   *
   * @export
   * @param {*} app
   * @returns
   */

  function toBootstrapPromise(app) {
    if (app.status !== NOT_BOOTSTRAPPED) {
      return Promise.resolve(app);
    }

    app.status = BOOTSTRAPPING;
    return reasonableTime(app.bootstrap(getProps(app)), "app: ".concat(app.name, " bootstraping"), app.timeouts.bootstrap).then(function () {
      app.status = NOT_MOUNTED;
      return app;
    }).catch(function (e) {
      console.log(e);
      app.status = SKIP_BECAUSE_BROKEN;
      return app;
    });
  }

  /**
   * 卸载 app
   *
   * @export
   * @param {*} app
   * @returns
   */

  function toUnmountPromise(app) {
    if (app.status !== MOUNTED) {
      return Promise.resolve(app);
    }

    app.status = UNMOUNTING;

    function unmountThisApp(serviceUnmountError) {
      return reasonableTime(app.unmount(getProps(app)), "app: ".concat(app.name, " unmounting"), app.timeouts.unmount).catch(function (e) {
        console.log(e);
        app.status = SKIP_BECAUSE_BROKEN;
      }).then(function () {
        if (app.status !== SKIP_BECAUSE_BROKEN) {
          app.status = serviceUnmountError === true ? SKIP_BECAUSE_BROKEN : NOT_MOUNTED;
        }

        return app;
      });
    } // 优先卸载当前 app 中的 service，如果存在的话


    var unmountServicePromise = Promise.all(Object.keys(app.services).map(function (name) {
      return app.services[name].unmountSelf();
    }));
    return unmountServicePromise.catch(function (e) {
      console.log(e);
      return true;
    }).then(unmountThisApp);
  }

  /**
   * 挂载 app
   *
   * @export
   * @param {*} app
   * @returns
   */

  function toMountPromise(app) {
    if (app.status !== NOT_MOUNTED) {
      return Promise.resolve(app);
    }

    app.status = MOUNTING;
    return reasonableTime(app.mount(getProps(app)), "app: ".concat(app.name, " mounting"), app.timeouts.mount).then(function () {
      app.status = MOUNTED;
    }).catch(function (e) {
      console.log(e);
      app.status = MOUNTED;
      return toUnmountPromise(app).catch(function (e) {
        console.log(e);
      }).then(function () {
        app.status = SKIP_BECAUSE_BROKEN;
        return app;
      });
    });
  }

  /**
   * 更新 service
   *
   * @export
   * @param {*} service
   * @returns
   */

  function toUpdatePromise(service) {
    if (service.status !== MOUNTED) {
      return Promise.resolve(service);
    }

    service.status = UPDATING;
    return reasonableTime(service.update(getProps(service)), "service: ".concat(service.name, " updating"), service.timeouts.mount).then(function () {
      service.status = MOUNTED;
      return service;
    }).catch(function (e) {
      console.log(e);
      service.status = SKIP_BECAUSE_BROKEN;
      return service;
    });
  }

  var serviceIndex = 0;
  var systemService = {
    services: {}
  };
  /**
   * 挂载系统服务
   * @return {{mount(): Promise, unmount(): Promise, update(Object): Promise, getStatus(): string}}
   * @export
   */

  function mountSystemService() {
    return mountService.apply(systemService, arguments);
  }
  /**
   * 根据名称获取系统服务
   *
   * @export
   */

  function getSystemService(serviceName) {
    return systemService[serviceName] || {};
  }
  /**
   * 挂载服务
   *
   * @export
   * @param {*} config 服务配置或加载函数
   * @param {*} [props={}] 传入服务的属性
   */

  function mountService(config) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!config || !/^(object|function)$/.test(_typeof(config))) {
      throw new Error('cannot mount services without config or config load function');
    }

    var context = this;
    serviceIndex++;
    var loadServicePromise = typeof config === 'function' ? config() : function () {
      return Promise.resolve(config);
    };

    if (!smellLikeAPromise(loadServicePromise)) {
      throw new Error('config load function must be a promise or thenable');
    }

    var service = {
      id: serviceIndex,
      // service 支持嵌套
      services: {},
      status: LOAD_RESOURCE_CODE,
      props: props,
      context: context
    };
    loadServicePromise = loadServicePromise.then(function (serviceConfig) {
      var errorMsg = [];
      var name = "service: ".concat(service.id);

      if (_typeof(serviceConfig) !== 'object') {
        errorMsg.push("service load function dose not export anything");
      }

      ['bootstrap', 'mount', 'unmount', 'update'].forEach(function (lifecycle) {
        // update 是可选的
        if (lifecycle === 'update' && !serviceConfig[lifecycle]) {
          return;
        }

        if (!validateLifeCyclesFn(serviceConfig[lifecycle])) {
          errorMsg.push("service dose not export ".concat(lifecycle, " as a function or function array"));
        }
      });

      if (errorMsg.length) {
        service.status = SKIP_BECAUSE_BROKEN;
        throw new Error(errorMsg.toString());
      }

      service.name = name;
      service.status = NOT_BOOTSTRAPPED;
      service.bootstrap = flattenFnArray(serviceConfig.bootstrap, "service bootstrap functions");
      service.mount = flattenFnArray(serviceConfig.mount, "service mount functions");
      service.unmount = flattenFnArray(serviceConfig.unmount, "service unmount functions");
      service.timeouts = ensureAppTimeouts(serviceConfig.timeouts);

      if (serviceConfig.update) {
        service.update = flattenFnArray(serviceConfig.update, 'service update function');
      }
    });
    loadServicePromise = loadServicePromise.then(function () {
      return toBootstrapPromise(service);
    });
    var actions = {
      mount: function mount() {
        return loadServicePromise.then(function () {
          context.services[service.name] = service;
          return toMountPromise(service);
        }).then(function () {
          if (service.status !== MOUNTED) {
            delete context.services[service.name];
          }
        });
      },
      unmount: function unmount() {
        return toUnmountPromise(service).then(function () {
          delete context.services[service.name];
        });
      },
      update: function update() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        service.props = props;
        return toUpdatePromise(service);
      },
      getStatus: function getStatus() {
        return service.status;
      },
      getRawData: function getRawData() {
        return _objectSpread2({}, service);
      }
    };
    service.unmountSelf = actions.unmount;
    service.mountSelf = actions.mount;
    service.updateSelf = actions.update;
    return actions;
  }

  function getProps(app) {
    return _objectSpread2({}, app.customProps, {
      name: app.name,
      // 将此方法传入 app 中，让 app 可以在内部自由挂载服务
      mountService: mountService.bind(app),
      mySingleSpa: mySingleSpa
    });
  }
  function smellLikeAPromise(promise) {
    if (promise instanceof Promise) {
      return true;
    }

    return _typeof(promise) === 'object' && promise.then === 'function' && promise.catch === 'function';
  }
  function validateLifeCyclesFn(fn) {
    if (typeof fn === 'function') {
      return true;
    }

    if (Array.isArray(fn)) {
      return fn.filter(function (item) {
        return typeof item !== 'function';
      }).length === 0;
    }

    return false;
  }
  /**
   * app 的生命周期函数可以传入数组或函数，但是它们必须返回 Promise
   */

  function flattenFnArray(fns, description) {
    // 若传入的不是 Array，则转化为 Array
    if (!Array.isArray(fns)) {
      fns = [fns];
    }

    if (fns.length === 0) {
      fns = [function () {
        return Promise.resolve();
      }];
    }

    return function (props) {
      return new Promise(function (resolve, reject) {
        waitForPromises(0);

        function waitForPromises(index) {
          var fn = fns[index](props);

          if (!smellLikeAPromise(fn)) {
            reject("".concat(description, " at index ").concat(index, " did not return a promise"));
            return;
          }

          fn.then(function () {
            if (index === fns.length - 1) {
              resolve();
            } else {
              waitForPromises(++index);
            }
          }).catch(function (e) {
            reject(e);
          });
        }
      });
    };
  }

  /**
   * 加载 app
   *
   * @export
   * @param {*} app
   * @returns
   */

  function toLoadPromise(app) {
    if (app.status !== NOT_LOADED && app.status !== LOAD_ERROR) {
      return Promise.resolve(app);
    }

    app.status = LOAD_RESOURCE_CODE;
    var loadPromise = app.loadApp(getProps(app));

    if (!smellLikeAPromise(loadPromise)) {
      console.log('app loadFunction must return a promise');
      app.status = SKIP_BECAUSE_BROKEN;
      return Promise.resolve(app);
    }

    return loadPromise.then(function (module) {
      var errorMsg = [];

      if (_typeof(module) !== 'object') {
        errorMsg.push("app: ".concat(app.name, " dose not export anything"));
      }

      ['bootstrap', 'mount', 'unmount'].forEach(function (lifecycle) {
        if (!validateLifeCyclesFn(module[lifecycle])) {
          errorMsg.push("app: ".concat(app.name, " dose not export ").concat(lifecycle, " as a function or function array"));
        }
      });

      if (errorMsg.length) {
        console.log(errorMsg);
        app.status = SKIP_BECAUSE_BROKEN;
        return app;
      }

      app.status = NOT_BOOTSTRAPPED;
      app.bootstrap = flattenFnArray(module.bootstrap, "app: ".concat(app.name, " bootstrap functions"));
      app.mount = flattenFnArray(module.mount, "app: ".concat(app.name, " mount functions"));
      app.unmount = flattenFnArray(module.unmount, "app: ".concat(app.name, " unmount functions"));
      app.unload = flattenFnArray(module.unload ? module.unload : [], "app: ".concat(app.name, " unload functions"));
      app.timeouts = ensureAppTimeouts(module.timeouts);
      return app;
    }).catch(function (e) {
      console.log(e);
      app.status = LOAD_ERROR;
      return app;
    });
  }

  var started = false;
  function start() {
    if (started) {
      return;
    }

    started = true;
    return invoke();
  }
  function isStarted() {
    return started;
  }

  /**
   * 微前端中 app 分为两种：一种是根据 location 进行变化的，称之为 app；一种是纯功能级别的，称之为 service
   * 要实现根据 location 的变化动态进行 mount 和 unmount 那些符合条件的 app，需要对浏览器的 location 相关操作进行统一拦截
   * 为了在使用Vue、React等视图框架时降低冲突，我们需要保证微前端必须是第一个处理Location的相关事件，然后才是Vue或React等框架的Router处理
   *
   *
   * 为什么Location改变时，微前端框架一定要第一个执行相关操作哪？如何保证"第一个"？

   * 因为微前端框架要根据Location来对app进行mount或unmount操作。
   * 然后app内部使用的Vue或React才开始真正进行后续工作，这样可以最大程度减少app内部Vue或React的无用（冗余）操作。
   * 对原生的Location相关事件进行拦截（hijack），统一由微前端框架进行控制，这样就可以保证总是第一个执行
   */
  var HIJACK_EVENTS_NAME = /^(hashchange|popstage)$/;
  var EVENTS_POOL = {
    hashchange: [],
    popstage: []
  };

  function reroute() {
    invoke([], arguments);
  }

  window.addEventListener('hashchange', reroute);
  window.addEventListener('popstate', reroute); // 拦截所以注册的事件，确保这里的事件总是第一个执行

  var originAddEventListener = window.addEventListener;
  var originRemoveEventListener = window.removeEventListener;

  window.addEventListener = function (eventName, handler, args) {
    if (eventName && HIJACK_EVENTS_NAME.test(eventName) && typeof handler === 'function') {
      // 放入队列，等待处理
      EVENTS_POOL[eventName].indexOf(handler) === -1 && EVENTS_POOL[eventName].push(handler);
    }

    return originAddEventListener.apply(this, arguments);
  };

  window.removeEventListener = function (eventName, handler) {
    if (eventName && HIJACK_EVENTS_NAME.test(eventName) && typeof handler === 'function') {
      var eventList = EVENTS_POOL[eventName];
      eventList.indexOf(handler) > -1 && (EVENTS_POOL[eventName] = eventList.filter(function (fn) {
        return fn !== handler;
      }));
    }

    originRemoveEventListener.apply(this, arguments);
  }; // 拦截 history 的方法，因为 pushState 和 repalceState方法并不会触发 onpopstate 事件
  // 所以即便我们在 onpopstate时执行了 reroute 方法，也要在这里执行


  var originHistoryPushState = window.history.pushState;
  var originHistoryReplaceState = window.history.replaceState;

  window.history.pushState = function (state, title, url) {
    var result = originHistoryPushState.apply(this, arguments);
    reroute(mockPopStateEvents(state));
    return result;
  };

  window.history.replaceState = function (state, title, url) {
    var result = originHistoryReplaceState.apply(this, arguments);
    reroute(mockPopStateEvents(state));
    return result;
  };

  function mockPopStateEvents(state) {
    // 手动触发 popstate
    return new PopStateEvent('popstate', {
      state: state
    });
  }

  function callCapturedEvents(eventArgs) {
    if (!eventArgs) {
      return;
    }

    if (Array.isArray(eventArgs)) {
      eventArgs = eventArgs[0];
    }

    var name = eventArgs.type;

    if (!HIJACK_EVENTS_NAME.test(name)) {
      return;
    } // 执行


    EVENTS_POOL[name].forEach(function (handler) {
      return handler.apply(window, eventArgs);
    });
  }

  var loadAppsUnderway = false;
  var pendingPromises = [];
  /**
   * 整个系统的触发机制分为两类
   * 1 浏览器触发：浏览器 location 发生改版，拦截 onhashchange 和 onpopstate 事件，并 mock 浏览器 history 的 pushState 和 replaceState 方法
   * 2 手动触发：手动调用框架的 registerApplication 或 start 方法
   *
   * @export
   * @param {*} pendings
   * @param {*} eventArgs
   * @returns
   */

  function invoke(pendings, eventArgs) {
    if (loadAppsUnderway) {
      return new Promise(function (resolve, reject) {
        pendingPromises.push({
          success: resolve,
          failure: reject,
          eventArgs: eventArgs
        });
      });
    }

    loadAppsUnderway = true;

    if (isStarted()) {
      // 微前端框架已启动
      return performAppChanges();
    }

    return loadApps(); // 找到需要 load 的 app

    function loadApps() {
      var loadPromises = getAppsToLoad().map(toLoadPromise);
      return Promise.all(loadPromises).then(function () {
        callAllLocationEvents();
        return finish();
      }).catch(function (e) {
        callAllLocationEvents();
        console.log(e);
      });
    } // 启动 app


    function performAppChanges() {
      // getAppsToUnmount
      var unmountApps = getAppsToUnmount();
      var unmountPromises = Promise.all(unmountApps.map(toUnmountPromise)); // getAppsToLoad

      var loadApps = getAppsToLoad();
      var loadPromises = loadApps.map(function (app) {
        return toLoadPromise(app).then(function (app) {
          return toBootstrapPromise(app);
        }).then(function () {
          return unmountPromises;
        }).then(function () {
          return toMountPromise(app);
        });
      });
      var mountApps = getAppsToMount().filter(function (app) {
        return loadApps.indexOf(app) === -1;
      });
      var mountPromises = mountApps.map(function (app) {
        return toBootstrapPromise(app).then(function () {
          return unmountPromises;
        }).then(function () {
          return toMountPromise(app);
        });
      });
      return unmountPromises.then(function () {
        callAllLocationEvents();
        var loadAndMountPromises = loadPromises.concat(mountPromises);
        return Promise.all(loadAndMountPromises).then(finish, function (ex) {
          pendings.forEach(function (item) {
            return item.reject(ex);
          });
          throw ex;
        });
      }, function (e) {
        callAllLocationEvents();
        console.log(e);
        throw e;
      });
    }

    function finish() {
      var resolveValue = getMountedApps();

      if (pendings) {
        // pendings 是上一次循环进行时存储的一批 changesQueue 的别名
        pendings.forEach(function (item) {
          return item.success(resolveValue);
        });
      } // 标记循环已结束


      loadAppsUnderway = false;

      if (pendingPromises.length) {
        var backup = pendingPromises;
        pendingPromises = []; // 将修改队列传入 invoke 开启下一次循环

        return invoke(backup);
      }

      return resolveValue;
    } // 每次循环终止时触发已拦截的 location 事件
    // 保证微前端框架的 location 触发时机总是首先被执行
    // 而 Vue 或 React 的 Router 总是在后面执行


    function callAllLocationEvents() {
      pendings && pendings.length && pendings.filter(function (item) {
        return item.eventArgs;
      }).forEach(function (item) {
        return callCapturedEvents(item.eventArgs);
      });
      eventArgs && callCapturedEvents(eventArgs);
    }
  }

  var APPS = [];
  /**
   * 获取满足加载条件的 app
   * 1 没有加载中断
   * 2 没有加载错误
   * 3 没有被加载过
   * 4 满足 app.activityWhen()
   *
   * @export
   */

  function getAppsToLoad() {
    return APPS.filter(notSkipped).filter(withoutLoadError).filter(isntLoaded).filter(shouldBeActive);
  }
  /**
   * 获取需要 mount 的 app
   * 1 没有加载中断
   * 2 加载过的
   * 3 当前没有 mounted 的
   * 4 需要被 mounted 的
   *
   * @export
   */

  function getAppsToMount() {
    return APPS.filter(notSkipped).filter(isLoaded).filter(isntActive).filter(shouldBeActive);
  }
  /**
   * 需要被 unmount 的 app
   * 没有加载中断
   * 正在挂着的
   * 需要卸载的
   *
   * @export
   */

  function getAppsToUnmount() {
    return APPS.filter(notSkipped).filter(isActive).filter(shouldntBeActive);
  }
  /**
   * 获取所有 app 的名称
   *
   * @export
   */

  function getAppNames() {
    return APPS.map(function (item) {
      return item.name;
    });
  }
  /**
   * 获取 app 状态
   *
   * @export
   * @param {*} name
   * @returns
   */

  function getAppStatus(name) {
    if (!name) {
      return APPS.map(function (item) {
        return item.status;
      });
    }

    var app = APPS.find(function (item) {
      return item.name === name;
    });
    return app ? app.status : null;
  }
  /**
   * 获取原始 app 数据
   *
   * @export
   * @returns
   */

  function getRawApps() {
    return [].concat(APPS);
  }
  /**
   * 获取 mounted 的 app
   *
   * @export
   * @returns
   */

  function getMountedApps() {
    return APPS.filter(isActive).map(function (item) {
      return item.name;
    });
  }
  /**
   * 注册 application
   *
   * @export
   * @param {*} appName application 名称
   * @param {*} applicationOrLoadFunction app 配置或 app 异步加载函数
   * @param {*} activityWhen 判断是否应该被挂载
   * @param {*} [customProps={}] 自定义配置
   * @return {Promise}
   */

  function registerApplication(appName, _applicationOrLoadFunction, activityWhen) {
    var customProps = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (!appName || typeof appName !== 'string') {
      throw new Error('the app name must be a non-empty string');
    }

    if (getAppNames().indexOf(appName) !== -1) {
      throw new Error("There is already an app declared with name ".concat(appName));
    }

    if (_typeof(customProps) !== 'object' || Array.isArray(customProps)) {
      throw new Error('the customProps must be a pure object');
    }

    if (!_applicationOrLoadFunction) {
      throw new Error('the application or load function is required');
    }

    if (typeof activityWhen !== 'function') {
      throw new Error('the activityWhen must be a function');
    }

    if (typeof _applicationOrLoadFunction !== 'function') {
      _applicationOrLoadFunction = function applicationOrLoadFunction() {
        return Promise.resolve(_applicationOrLoadFunction);
      };
    }

    APPS.push({
      name: appName,
      loadApp: _applicationOrLoadFunction,
      activityWhen: activityWhen,
      customProps: customProps,
      status: NOT_LOADED,
      services: {}
    });
    return invoke();
  }



  exports.BOOTSTRAPPING = BOOTSTRAPPING;
  exports.LOAD_ERROR = LOAD_ERROR;
  exports.LOAD_RESOURCE_CODE = LOAD_RESOURCE_CODE;
  exports.MOUNTED = MOUNTED;
  exports.NOT_BOOTSTRAPPED = NOT_BOOTSTRAPPED;
  exports.NOT_LOADED = NOT_LOADED;
  exports.NOT_MOUNTED = NOT_MOUNTED;
  exports.SKIP_BECAUSE_BROKEN = SKIP_BECAUSE_BROKEN;
  exports.UNMOUNTING = UNMOUNTING;
  exports.getAppNames = getAppNames;
  exports.getAppStatus = getAppStatus;
  exports.getRawApps = getRawApps;
  exports.getSystemService = getSystemService;
  exports.mountSystemService = mountSystemService;
  exports.registerApplication = registerApplication;
  exports.setBootstrapMaxTime = setBootstrapMaxTime;
  exports.setMountMaxTime = setMountMaxTime;
  exports.setUnloadMaxTime = setUnloadMaxTime;
  exports.setUnmountMaxTime = setUnmountMaxTime;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=my-single-spa.js.map
