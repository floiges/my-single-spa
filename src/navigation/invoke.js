'use strict';

import {
  getAppsToLoad,
  getAppsToMount,
  getAppsToUnmount,
  getMountedApps,
} from '../applications/apps';
import { toLoadPromise } from '../lifecycles/load';
import { toBootstrapPromise } from '../lifecycles/bootstrap';
import { toMountPromise } from '../lifecycles/mount';
import { toUnmountPromise } from '../lifecycles/unmount';
import { isStarted } from '../start';
import { callCapturedEvents } from './hijackLocation';

let loadAppsUnderway = false;
let pendingPromises = [];

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
export function invoke(pendings, eventArgs) {
  if (loadAppsUnderway) {
    return new Promise((resolve, reject) => {
      pendingPromises.push({ success: resolve, failure: reject, eventArgs });
    });
  }

  loadAppsUnderway = true;
  if (isStarted()) {
    // 微前端框架已启动
    return performAppChanges();
  }
  return loadApps();

  // 找到需要 load 的 app
  function loadApps() {
    let loadPromises = getAppsToLoad().map(toLoadPromise);
    return Promise.all(loadPromises).then(() => {
      callAllLocationEvents();
      return finish();
    }).catch(e => {
      callAllLocationEvents();
      console.log(e);
    });
  }

  // 启动 app
  function performAppChanges() {
    // getAppsToUnmount
    let unmountApps = getAppsToUnmount();
    let unmountPromises = Promise.all(unmountApps.map(toUnmountPromise));

    // getAppsToLoad
    let loadApps = getAppsToLoad();
    let loadPromises = loadApps.map(app => {
      return toLoadPromise(app)
        .then(app => toBootstrapPromise(app))
        .then(() => unmountPromises)
        .then(() => toMountPromise(app));
    });

    let mountApps = getAppsToMount().filter(app => loadApps.indexOf(app) === -1);
    let mountPromises = mountApps.map(app => {
      return toBootstrapPromise(app).then(() => unmountPromises).then(() => toMountPromise(app));
    });

    return unmountPromises.then(() => {
      callAllLocationEvents();
      let loadAndMountPromises = loadPromises.concat(mountPromises);
      return Promise.all(loadAndMountPromises).then(finish, ex => {
        pendings.forEach(item => item.reject(ex));
        throw ex;
      });
    }, e => {
      callAllLocationEvents();
      console.log(e);
      throw e;
    });
  }

  function finish() {
    let resolveValue = getMountedApps();
    if (pendings) {
      // pendings 是上一次循环进行时存储的一批 changesQueue 的别名
      pendings.forEach(item => item.success(resolveValue));
    }

    // 标记循环已结束
    loadAppsUnderway = false;
    if (pendingPromises.length) {
      const backup = pendingPromises;
      pendingPromises = [];
      // 将修改队列传入 invoke 开启下一次循环
      return invoke(backup);
    }

    return resolveValue;
  }

  function callAllLocationEvents() {
    pendings
    && pendings.length
    && pendings.filter(item => item.eventArgs).forEach(item => callCapturedEvents(item.eventArgs));
    eventArgs && callCapturedEvents(eventArgs);
  }
}
