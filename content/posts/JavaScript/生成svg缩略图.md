---
title: JavaScript 生成SVG缩略图
date: 2019-06-27 11:11:11
tags: ["JavaScript"]
---

这个 svg 是 D3js 动态生成的力导图，需要在列表页中快速展示，图表一多，直接展示的话，电脑吃不消，所以就想将其变成 base64 编码的静态图片，不考虑交互，因为是在列表页。

啥是 base64 ？
Base64 是网络上最常见的用于传输 8Bit 字节码的编码方式之一，Base64 就是一种基于 64 个可打印字符来表示二进制数据的方法。

why？

1. base64 是字符串，可以很方便的存在数据库中。
2. 如果直接存图片类型，需要额外的 http 请求，对列表页来说，消耗挺大。

## 实现

在 vue 中的实现:

```js
let dom = this.$refs.chart.$el;
//ref 被用来给元素或子组件注册引用信息。引用信息将会注册在父组件的 $refs 对象上。如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例, 这里就是在子组件上。

let thumbDom = dom.cloneNode(true);
// 参数true为递归复制元素，这里复制一下，避免对渲染中的元素进行直接修改
// ...可以对 thumbDom进行修改

let str = new XMLSerializer().serializeToString(thumbDom);
// https://www.zhangxinxu.com/wordpress/2019/06/domparser-xmlserializer-api/
// 这篇文章有讲解XMLSerializer对象
let encodeData = "data:image/svg+xml;base64," + window.btoa(str);
// btoa 字符串转 base64
// atob base64转 字符串
// https://segmentfault.com/a/1190000016379916
```

这个 encodeData 就是这个图片的 DataURL
可以直接 `<img :src="encodeData" />` 这样使用。

问题：

1. 如何减少图片的大小，因为是缩略图，可以缩小一些尺寸，不过好像 svg 也不好缩了。
