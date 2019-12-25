'use strict';

(function(global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined'
		? factory(exports)
		: typeof define === 'function' && define.amd
		? define(['exports'], factory)
		: ((global = global || self), (global.innerService = factory()));
}(this, function () {
  'use strict';

  let context = { container: null };
  return {
    bootstrap: function () {
      context.container = document.getElementById('app');
      return Promise.resolve();
    },
    mount: function () {
      context.container.innerHTML += '<div style="margin: 10px;cursor: pointer;">我来自内部服务：我是某个APP的内部服务，只能这个APP才能管我~</div>';
      return Promise.resolve();
    },
    unmount: function () {
      return Promise.resolve();
    },
    update: function () {
      context.container.appendChild(document.createTextNode('little pig ···'));
      return Promise.resolve();
    }
  };
}));
