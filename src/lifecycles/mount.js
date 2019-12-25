'use strict';

import {
  MOUNTED,
  NOT_MOUNTED,
  SKIP_BECAUSE_BROKEN,
  MOUNTING,
} from '../applications/app.helper';
import { reasonableTime } from '../applications/timeouts';
import { getProps } from './helper';
import { toUnmountPromise } from './unmount';

/**
 * 挂载 app
 *
 * @export
 * @param {*} app
 * @returns
 */
export function toMountPromise(app) {
  if (app.status !== NOT_MOUNTED) {
    return Promise.resolve(app);
  }

  app.status = MOUNTING;
  return reasonableTime(app.mount(getProps(app)), `app: ${app.name} mounting`, app.timeouts.mount).then(() => {
    app.status = MOUNTED;
  }).catch(e => {
    console.log(e);
    app.status = MOUNTED;

    return toUnmountPromise(app).catch(e => {
      console.log(e);
    }).then(() => {
      app.status = SKIP_BECAUSE_BROKEN;
      return app;
    });
  });
}