'use strict';

import {
  NOT_LOADED,
  notSkipped,
  withoutLoadError,
  isntLoaded,
  shouldBeActive,
  shouldntBeActive,
  isLoaded,
  isntActive,
  isActive,
} from './app.helper';
import { invoke } from '../navigation/invoke';

const APPS = [];

/**
 * 获取满足加载条件的 app
 * 1 没有加载中断
 * 2 没有加载错误
 * 3 没有被加载过
 * 4 满足 app.activityWhen()
 *
 * @export
 */
export function getAppsToLoad() {
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
export function getAppsToMount() {
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
export function getAppsToUnmount() {
  return APPS.filter(notSkipped).filter(isActive).filter(shouldntBeActive);
}

/**
 * 获取所有 app 的名称
 *
 * @export
 */
export function getAppNames() {
  return APPS.map(item => item.name);
}

/**
 * 获取 app 状态
 *
 * @export
 * @param {*} name
 * @returns
 */
export function getAppStatus(name) {
  if (!name) {
    return APPS.map(item => item.status);
  }

  let app = APPS.find(item => item.name === name);
  return app ? app.status : null;
}

/**
 * 获取原始 app 数据
 *
 * @export
 * @returns
 */
export function getRawApps() {
  return [...APPS];
}

/**
 * 获取 mounted 的 app
 *
 * @export
 * @returns
 */
export function getMountedApps() {
  return APPS.filter(isActive).map(item => item.name);
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
export function registerApplication(appName, applicationOrLoadFunction, activityWhen, customProps = {}) {
  if (!appName || typeof appName !== 'string') {
    throw new Error('the app name must be a non-empty string');
  }
  if (getAppNames().indexOf(appName) !== -1) {
    throw new Error(`There is already an app declared with name ${appName}`);
  }
  if (typeof customProps !== 'object' || Array.isArray(customProps)) {
    throw new Error('the customProps must be a pure object');
  }
  if (!applicationOrLoadFunction) {
    throw new Error('the application or load function is required');
  }
  if (typeof activityWhen !== 'function') {
    throw new Error('the activityWhen must be a function');
  }
  if (typeof applicationOrLoadFunction !== 'function') {
    applicationOrLoadFunction = () => Promise.resolve(applicationOrLoadFunction);
  }

  APPS.push({
    name: appName,
    loadApp: applicationOrLoadFunction,
    activityWhen,
    customProps,
    status: NOT_LOADED,
    services: {},
  });

  return invoke();
}