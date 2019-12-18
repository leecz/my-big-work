---
title: 2019年8月
date: 2019-08-01 11:11:11
tags: weibo
---

## 2019-08

### 2019-08-01
新的一月开始，依然忙碌, 这可能是今年以来最充实(忙成狗)的日子。

### 2019-08-02
一个 js 的小技巧
一个对象比如：

```js
a = {
  b: 1,
  c: 2,
  d: 3,
  d: 4,
  e: 5,
  f: [1, 2, 3, 4]
}
// 需要转换成
b = {
  f: [1, 2, 3, 4],
  x: {
    b: 1,
    c: 2,
    d: 3,
    d: 4,
    e: 5,
  }
}

// 直接写肯定是可以, 但是如果有100个属性呢
// 可以这样搞

let {f, ...x} = a
let b = {f, x}
```

真吉尔好用。


### 2019-08-06
开始学习 React Native 的动画，


### 2019-08-23
在看 http 图解，收获良多。

### 2019-08-28
css 中的百分比都是相对于谁？

知乎这个回答好

作者：Boring
链接：https://www.zhihu.com/question/36079531/answer/65809167
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

相对于父级宽度的：max-width、min-width、width、left、right、text-indent、padding、margin、grid-template-columns、grid-auto-columns、column-gap 等；

相对于父级高度的：max-height、min-height、height、top、bottom、grid-template-rows、grid-auto-rows、row-gap 等；

相对于主轴长度的：flex-basis 等；

相对于继承字号的：font-size 等；

相对于自身字号的：line-height 等；

相对于自身宽高的：border-radius、background-size、border-image-width、transform: translate()、transform-origin、zoom、clip-path 等；

相对于行高的：vertical-align 等；

特殊算法的：background-position （方向长度 / 该方向除背景图之外部分总长度）、border-image-slice （相对于图片尺寸）、filter 系列函数等；

如果自身设置 position: absolute，“父级”指：Boring：破坏文档流的div高度设为百分比是相对谁而言的？；

如果 position: fixed，“父级”指视口（父级不存在 transform 为非 none 值的情况下）。


### 2019-08-29

dom 的方法 scrollIntoView

// "react-native-scrollable-tab-view": "^0.10.0",
// "react-native-scrollable-tab-view": "fill:../react...",

// yarn upgrade react-na...


### 2019-08-30

8月完
