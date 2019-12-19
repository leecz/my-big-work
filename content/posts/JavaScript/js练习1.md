---
title: JavaScript 练习
date: 2019-06-26 11:11:11
tags: ["JavaScript"]
---

## new 的实现原理

new 的用法：

```js
function A(a) {
  this.a = a;
}
let a = new A("a");
```

实现思路：

1. 接受一个函数作为第一个参数。
2. 接受函数的参数
3. 创建一个新的对象
4. 在新的对象上执行函数，如果执行结果值为对象或者函数，则返回该结果，否者返回 3 创建的对象

实现：

```js
function _new() {
  let [fn, ...args] = [...arguments];
  let obj = {};
  obj.__proto__ = fn.prototype; // 连接对象的原型
  let result = fn.call(obj, ...args);
  if (result && (typeof result === "object" || typeof result === "function")) {
    return result;
  }
  return obj;
}
```

## 如何确定 this 的指向？

谁调用它，就指向谁

- 全局对象，比如 `window`，`global`；
- 显示的对象调用，比如`obj.puts()`
- new 操作中，指向被创建的对象
- call、apply、bind 中，指定的对象。
- 箭头函数，默认绑定外层上下文的 this。

## 深拷贝和浅拷贝的区别是什么？实现一个深拷贝

浅拷贝只拷贝一层，而深拷贝是层层拷贝。
浅拷贝：`for in, Object.assign, ...运算符, Array.prototype.slice(), Array.prototype.concat()`
深拷贝：json 数据可以使用 `JSON.parse(JSON.stringfy(obj))` 实现。对于复杂的数据，可以自己实现，也可以使用 Lodash 中的方法。

自己实现思路：

1. 简单的数据直接拷贝
2. 日期和正则单独处理
3. 对象和数组循环递归处理

```js
function deepClone(obj, hash = new WeakMap()) {
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  let t = new obj.constructor();
  hash.set(obj, t);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      t[key] = deepClone(obj[key], hash);
    }
  }
  return t;
}

let a = {
  b: [
    1,
    2,
    3,
    {
      c: 4
    }
  ],
  c: { d: 3 },
  d: 6
};

let clone = deepClone(a);
console.log(`b should be false : ${a.b === clone.b}`);
console.log(`d should be true: ${a.d === clone.d}`);
console.log(`c should be false: ${a.c === clone.c}`);
```

## call/apply 的实现原理是什么？

call 和 apply 都有改变函数 this 指向的作用，都是作用在函数上，实现的时候需要注意，实现函数的 this 就是需要调用的函数，上下文对象中加入的函数，执行完要删除

```js
Function.prototype._call = function(context, ...args) {
  if (!context) {
    context = typeof window === "undefined" ? global : window;
  }
  context.fn = this;
  let result = context.fn(...args);
  delete context.fn;
  return result;
};
```

## curry 函数实现

核心就是比较参数长短。

```js
let curry = (fn, ...args) => {
  return args.length < fn.length
    ? (...arguments) => curry(fn, ...args, ...arguments)
    : fn(...args);
};
```
