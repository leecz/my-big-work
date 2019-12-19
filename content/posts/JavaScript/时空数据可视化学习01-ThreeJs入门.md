---
title: 时空数据可视化学习01-ThreeJs入门
date: 2019-07-01 11:11:11
tags: ["JavaScript", "ThreeJS"]
---

参考教程： [从零开始学习时空数据可视化(一)](https://zhuanlan.zhihu.com/p/61350952)

本次学习目的：

> 初步了解 WebGL 的一些基本概念与 three.js 的基本内容；
> 实战编写一个简单的几何体动画来熟悉 three.js 中的一些基本 API；

### WebGL 是

来自维基百科：

> WebGL 是一种 JavaScript API，用于在不使用插件的情况下在任何兼容的网页浏览器中呈现交互式 2D 和 3D 图形。WebGL 完全集成到浏览器的所有网页标准中，可将影像处理和效果的 GPU 加速使用方式当做网页 Canvas 的一部分。WebGL 元素可以加入其他 HTML 元素之中并与网页或网页背景的其他部分混合。WebGL 程序由 JavaScript 编写的句柄和 OpenGL Shading Language（GLSL）编写的着色器代码组成，该语言类似于 C 或 C++，并在计算机的图形处理器（GPU）上运行。WebGL 由非营利 Khronos Group 设计和维护。

可以简单的理解为在 canvas 上绘图的一种协议，尤其是在 3D 领域。

### 检测浏览器用户环境是否支持 WebGL ?

```js
const detectWebGLContext = () => {
  let canvas = document.createElement("canvas");
  let gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  let msgTxt = "无法检测到 WebGL 上下文，你的浏览器不支持 WebGL。";
  if (gl && gl instanceof WebGLRenderingContext) {
    msgTxt = "恭喜，你的浏览器支持 WebGL！";
  }

  alert(msgTxt);
};
```

### 清空画布

```js
const clearWithColor = gl => {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.clearColor(0.0, 0.5, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);
};
```

### Three js 是

ThreeJs 是一个 JavaScript 库，封装了 WebGL 的 API。
Why ThreeJs ？
因为原生的 WebGL 的接口相当不直观，写起来非常繁琐，基本不是面向一般用户使用的。
ThreeJs 在顶层对 3D 绘图所需的各种元素（例如场景，摄像机，灯光，几何图像，材质等）进行了封装。

ThreeJs 中最小绘图环境包含 3 个要素：

1. 场景 -- 包含所有需要显示的 3D 物体以及其他相关元素的容器
2. 摄像机 -- 决定 3D 场景如何投影到 2D 画布之上
3. 渲染器 -- 用于最后绘制的画笔

想了解某个参数的含义，可以使用 在线 ThreeJs 编辑器: [https://threejs.org/editor/](https://threejs.org/editor/)

### Demo 学习

Demo 完整代码

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>时空数据可视化1</title>
    <style>
      body {
        background: #fff;
        padding: 0;
        margin: 0;
        overflow: hidden;
      }
      #glmapsTitle {
        position: absolute;
        left: 5px;
        top: 5px;
      }
    </style>
  </head>
  <body>
    <div id="glmapsTitle">
      从零开始学习时空数据可视化示例
      <a href="https://github.com/hijiangtao/glmaps">GitHub 代码地址</a>
    </div>

    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/three.js/103/three.min.js"
      integrity="sha256-T4lfPbatZLyNhpEgCvtmXmlhOUq0HZHkDX4cMlQWExA="
      crossorigin="anonymous"
    ></script>
    <script>
      let camera, scene, renderer, group;
      let mouseX = 0,
        mouseY = 0;
      let windowHalfX = window.innerWidth / 2;
      let windowHalfY = window.innerHeight / 2;

      // 初始化函数
      function init() {
        // 创建相机
        camera = new THREE.PerspectiveCamera(
          60,
          window.innerWidth / window.innerHeight,
          1,
          10000
        );
        camera.position.z = 500;
        // 创建场景
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        scene.fog = new THREE.Fog(0xffffff, 1, 10000);
        // 创建对象组，向组内添加1000个随机分布的网格对象
        // Mesh https://threejs.org/docs/index.html#api/en/objects/Mesh
        let geometry = new THREE.BoxBufferGeometry(100, 100, 100);
        let material = new THREE.MeshNormalMaterial();
        group = new THREE.Group();
        for (let i = 0; i < 1000; i++) {
          let mesh = new THREE.Mesh(geometry, material);
          mesh.position.x = Math.random() * 2000 - 1000;
          mesh.position.y = Math.random() * 2000 - 1000;
          mesh.position.z = Math.random() * 2000 - 1000;
          mesh.rotation.x = Math.random() * 2 * Math.PI;
          mesh.rotation.y = Math.random() * 2 * Math.PI;
          mesh.matrixAutoUpdate = false;
          mesh.updateMatrix();
          group.add(mesh);
        }
        // 将对象组添加到场景中
        scene.add(group);
        // 构建渲染器，并将其 canvas 对象添加至 body
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        // 注册事件响应
        // document.addEventListener('mousemove', onDocumentMouseMove, false);
        window.addEventListener("resize", onWindowResize, false);
        // 调用绘制函数
        animate();
      }
      // 窗口大小变化时更新 three.js 渲染器
      function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        // 摄像机的更新
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      // function onDocumentMouseMove(event) {
      //   mouseX = (event.clientX - windowHalfX) * 10;
      //   mouseY = (event.clientY - windowHalfY) * 10;
      // }
      // 逐帧绘制函数
      function animate() {
        requestAnimationFrame(animate);
        render();
      }
      //
      function render() {
        // 根据当前时间创建正弦偏移量
        let time = Date.now() * 0.001;
        let rx = Math.sin(time * 0.7) * 0.5,
          ry = Math.sin(time * 0.3) * 0.5,
          rz = Math.sin(time * 0.2) * 0.5;
        // 更新相机的坐标，并让相机面朝场景对准
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // 更新对象组的旋转坐标
        group.rotation.x = rx;
        group.rotation.y = ry;
        group.rotation.z = rz;

        //
        renderer.render(scene, camera);
      }
      // 应用入口
      init();
    </script>
  </body>
</html>
```

首先看 相机设置,位于 init 函数的第一行代码：

```js
camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
camera.position.z = 500;
```

Three.js 提供两种不同的相机：透视投影摄像机和正交投影摄像机

- 透视投影摄像机：这种摄像机的效果更贴近真实世界，物体离摄像机越远，他们就会被渲染得越小。
- 正交投影摄像机：对象相对于摄像机的距离对渲染结果是没有影响的。通常被用于二维游戏中。

看看这个图就明白了：
![摄像机工作原理图](https://raw.githubusercontent.com/leecz/images/master/blog20190701105404.png)

一般情况都会使用 PerspectiveCamera，来看看这个函数，
构造函数： `PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )`

- fov 可视角度
- aspect 实际窗口的纵横比
- near 近处的裁面的距离
- far 远处的裁面的距离

接着是我们需要绘制的物体了。在本例中，我们准备绘制 1000 个立方体，它们大小相同、位置随机分布。我们可以直接绘制 1000 个几何体然后把他们依次加入场景，但为了更好的管理，我们用组（API THREE.Group）来作为这些立方体的容器，组在功能上和 Object3D 几乎是相同的，其目的是使得组中对象在语法上的结构更加清晰。

而每个立方体我们用网格（API THREE.Mesh）来构建，网格被用来表示基于以三角形为 polygon mesh（多边形网格）的物体的类。而传入的 Mesh 构造器的两个参数，一个是几何体（API THREE.BoxBufferGeometry），你可以简单把它想像成用于描述几何体的一个有效表述集合，比如顶点位置，面片索引、法相量、颜色值等等；另一个是材质（API THREE.MeshNormalMaterial），材质被用来描述几何体的外观呈现。

这里有两行代码不是很理解为什么需要：

```js
mesh.matrixAutoUpdate = false;
mesh.updateMatrix();
```

不理解这个矩阵是什么，为什么这里要更新它。
有待进一步学习。

然后是渲染器

```js
// 构建渲染器，并将其 canvas 对象添加至 body
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

网上找的一个例子：

```js
//开启Three.js渲染器:WebGLRenderer
//声明全局变量
var renderer;
function initThree() {
  //获取容器的宽高
  width = document.getElementById("canvas3d").clientWidth; //获取画布「canvas3d」的宽
  height = document.getElementById("canvas3d").clientHeight; //获取画布「canvas3d」的高

  //声明渲染器对象：WebGLRenderer
  renderer = new THREE.WebGLRenderer({
    antialias: true, //是否开启反锯齿
    precision: "highp", //着色精度选择
    alpha: true, //是否可以设置背景色透明
    premultipliedAlpha: false,
    stencil: false,
    preserveDrawingBuffer: true, //是否保存绘图缓冲
    maxLights: 1 //maxLights:最大灯光数
  });

  //指定渲染器的高宽（和画布框大小一致）
  renderer.setSize(width, height);
  //追加canvas 元素到canvas3d元素中。
  document.getElementById("canvas3d").appendChild(renderer.domElement);
  //设置canvas背景色(clearColor)和背景色透明度（clearAlpha）
  renderer.setClearColor(0x000000, 0.5);
}
```

`camera.lookAt(scene.position)` 相机对准物体。

### 总结

ThreeJs 是对 WebGL 的封装。
最基本的三要素： 场景，渲染器，摄像机。

### 参考

[Threejs 快速入门](https://cloud.tencent.com/developer/news/84163)
[了解摄像机](https://www.cnblogs.com/leinov/p/6015156.html)
[Three.js 二三事](https://zhuanlan.zhihu.com/p/34717121)
[WebGL ThreeJS 学习总结一二](https://newbieweb.lione.me/2016/10/18/webgl-threejs-1-2/)
[渲染器](https://segmentfault.com/a/1190000014211729)
[摄像机移动 OrbitControls 轨道控件的围绕目标 target 参数](https://blog.csdn.net/ithanmang/article/details/82735273)
