# MY-SINGLE-SPA

## app 相关概念

微前端的核心为app，微前端的场景主要是：将应用拆分为多个app加载，或将多个不同的应用当成app组合在一起加载。

为了更好的约束app和行为，要求每个app必须向外export完整的生命周期函数，使微前端框架可以更好地跟踪和控制它们。

> 生命周期函数共有4个：bootstrap、mount、unmount、update。
> 生命周期可以传入 返回Promise的函数也可以传入 返回Promise函数的数组。

```javascript
// app1
export default {
  // app启动
  bootstrap: [() => Promise.resolve()],
  // app挂载
  mount: [() => Promise.resolve()],
  // app卸载
  unmount: [() => Promise.resolve()],
  // service更新，只有service才可用
  update: [() => Promise.resolve()]
};
```
