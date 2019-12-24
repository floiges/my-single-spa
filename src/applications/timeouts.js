'use strict';

const DEFAULT_TIMEOUTS = {
  bootstrap: {
    // 超时毫秒数
    milliseconds: 3000,
    // 当超时时，是否 reject
    rejectWhenTimeout: false,
  },
  mount: {
    // 超时毫秒数
    milliseconds: 3000,
    // 当超时时，是否 reject
    rejectWhenTimeout: false,
  },
  unmount: {
    // 超时毫秒数
    milliseconds: 3000,
    // 当超时时，是否 reject
    rejectWhenTimeout: false,
  },
  unload: {
    // 超时毫秒数
    milliseconds: 3000,
    // 当超时时，是否 reject
    rejectWhenTimeout: false,
  },
};

export function setBootstrapMaxTime(milliseconds, rejectWhenTimeout = false) {
  if (typeof milliseconds !== 'number' || milliseconds <= 0) {
    throw new Error(`${type} max time must be a positive integer number of milliseconds`);
  }
  DEFAULT_TIMEOUTS.bootstrap = { milliseconds, rejectWhenTimeout, };
}

export function setMountMaxTime(milliseconds, rejectWhenTimeout = false) {
  if (typeof milliseconds !== 'number' || milliseconds <= 0) {
    throw new Error(`${type} max time must be a positive integer number of milliseconds`);
  }
  DEFAULT_TIMEOUTS.mount = { milliseconds, rejectWhenTimeout, };
}

export function setUnmountMaxTime(milliseconds, rejectWhenTimeout = false) {
  if (typeof milliseconds !== 'number' || milliseconds <= 0) {
    throw new Error(`${type} max time must be a positive integer number of milliseconds`);
  }
  DEFAULT_TIMEOUTS.unmount = { milliseconds, rejectWhenTimeout, };
}

export function setUnloadMaxTime(milliseconds, rejectWhenTimeout = false) {
  if (typeof milliseconds !== 'number' || milliseconds <= 0) {
    throw new Error(`${type} max time must be a positive integer number of milliseconds`);
  }
  DEFAULT_TIMEOUTS.unload = { milliseconds, rejectWhenTimeout, };
}

export function ensureAppTimeouts(timeouts = {}) {
  return {
    ...DEFAULT_TIMEOUTS,
    ...timeouts,
  };
}

/**
 * 给每个app的生命周期函数增加超时的处理
 * promise： 经过 flattenFnArray 处理过的生命周期函数
 */
export function reasonableTime(promise, description, timeouts) {
  return new Promise((resolve, reject) => {
    let finised = false;

    promise.then(data => {
      finised = true;
      resolve(data);
    }).catch(e => {
      finised = true;
      reject(e);
    });

    setTimeout(() => maybeTimeout(), timeouts.milliseconds);

    function maybeTimeout() {
      if (finised) {
        return;
      }

      let error = `${description} did not resolve or reject for ${timeouts.milliseconds} milliseconds`;
      if (timeouts.rejectWhenTimeout) {
        reject(new Error(error));
      } else {
        console.error(error);
      }
    }
  });
}