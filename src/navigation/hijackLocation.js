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

'use strict';

// onhashchange onpopstate history.pushState() history.replaceState()

import { invoke } from './invoke';

const HIJACK_EVENTS_NAME = /^(hashchange|popstage)$/;
const EVENTS_POOL = {
  hashchange: [],
  popstage: [],
};

function reroute() {
  invoke([], arguments);
}

window.addEventListener('hashchange', reroute);
window.addEventListener('popstate', reroute);

// 拦截所以注册的事件，确保这里的事件总是第一个执行
const originAddEventListener = window.addEventListener;
const originRemoveEventListener = window.removeEventListener;
window.addEventListener = function (eventName, handler, args) {
  if (eventName && HIJACK_EVENTS_NAME.test(eventName) && typeof handler === 'function') {
    // 放入队列，等待处理
    EVENTS_POOL[eventName].indexOf(handler) === -1 && EVENTS_POOL[eventName].push(handler);
  }
  return originAddEventListener.apply(this, arguments);
};

window.removeEventListener = function (eventName, handler) {
  if (eventName && HIJACK_EVENTS_NAME.test(eventName) && typeof handler === 'function') {
    let eventList = EVENTS_POOL[eventName];
    eventList.indexOf(handler) > -1 && (EVENTS_POOL[eventName] = eventList.filter(fn => fn !== handler));
  }
  originRemoveEventListener.apply(this, arguments);
};

// 拦截 history 的方法，因为 pushState 和 repalceState方法并不会触发 onpopstate 事件
// 所以即便我们在 onpopstate时执行了 reroute 方法，也要在这里执行
const originHistoryPushState = window.history.pushState;
const originHistoryReplaceState = window.history.replaceState;
window.history.pushState = function (state, title, url) {
  let result = originHistoryPushState.apply(this, arguments);
  reroute(mockPopStateEvents(state));
  return result;
};
window.history.replaceState = function (state, title, url) {
  let result = originHistoryReplaceState.apply(this, arguments);
  reroute(mockPopStateEvents(state));
  return result;
};

function mockPopStateEvents(state) {
  // 手动触发 popstate
  return new PopStateEvent('popstate', { state, });
}

export function callCapturedEvents(eventArgs) {
  if (!eventArgs) {
    return;
  }

  if (Array.isArray(eventArgs)) {
    eventArgs = eventArgs[0];
  }
  let name = eventArgs.type;
  if (!HIJACK_EVENTS_NAME.test(name)) {
    return;
  }
  // 执行
  EVENTS_POOL[name].forEach(handler => handler.apply(window, eventArgs));
}