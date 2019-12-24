'use strict';

// 未加载
// app还未加载，默认状态
export const NOT_LOADED = 'NOT_LOADED';

// 加载 app 代码中
export const LOAD_RESOURCE_CODE = 'LOAD_RESOURCE_CODE';

// 加载成功，但未启动
// app模块加载完成，但是还未启动（未执行app的bootstrap生命周期函数）
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED';

// 启动中
// 执行app的bootstrap生命周期函数中（只执行一次）
export const BOOTSTRAPPING = 'BOOTSTRAPPING';

// 启动成功，但未挂载
// app的bootstrap或unmount生命周期函数执行成功，等待执行mount生命周期函数（可多次执行）
export const NOT_MOUNTED = 'NOT_MOUNTED';

// 挂载中
// 执行app的mount生命周期函数中
export const MOUNTING = 'MOUNTING';

// 挂载成功
// app的mount或update(service独有)生命周期函数执行成功，意味着此app已挂载成功，可执行Vue的$mount()或ReactDOM的render()
export const MOUNTED = 'MOUNTED';

// 卸载中
// 	app的unmount生命周期函数执行中，意味着此app正在卸载中，可执行Vue的$destory()或ReactDOM的unmountComponentAtNode()
export const UNMOUNTING = 'UNMOUNTING';

// 加载时参数校验未通过，或非致命错误
// app变更状态时遇见错误，如果app的状态变为了SKIP_BECAUSE_BROKEN，那么app就会blocking，不会往下个状态变更
export const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN';

// 加载时遇到致命错误
// 加载错误，意味着app将无法被使用
export const LOAD_ERROR = 'LOAD_ERROR';

// 更新 service 中
// service更新中，只有service才会有此状态，app则没有
export const UPDATING = 'UPDATING';

export function notSkipped(app) {
  return app.status !== SKIP_BECAUSE_BROKEN;
}

export function withoutLoadError(app) {
  return app.status !== LOAD_ERROR;
}

export function isLoaded(app) {
  return app.status !== NOT_LOADED && app.status !== LOAD_ERROR && app.status !== LOAD_RESOURCE_CODE;
}

export function isntLoaded(app) {
  return !isLoaded(app);
}

export function isActive(app) {
  return app.status === MOUNTED;
}

export function isntActive(app) {
  return !isActive(app);
}

export function shouldBeActive(app) {
  try {
    return app.activityWhen(window.location);
  } catch (e) {
    app.status = SKIP_BECAUSE_BROKEN;
    throw e;
  }
}

export function shouldntBeActive(app) {
  try {
    return !app.activityWhen(window.location);
  } catch (e) {
    app.status = SKIP_BECAUSE_BROKEN;
    throw e;
  }
}