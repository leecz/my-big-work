---
title: React Native 第一个应用
date: 2019-07-04 11:11:11
tags:
  - JavaScript
  - React Native
---

# React Native 第一个应用

经典的 [todo App](http://todomvc.com)

页面结构：

```js
<View> 
  <Heading /> 
  <Input /> 
  <TodoList /> 
  <Button /> 
  <TabBar /> 
</View>
```

![页面原型分析](https://raw.githubusercontent.com/leecz/images/master/blog20190704225926.png)

安装RN脚手架命令：`npm install -g react-native-cli`
初始化应用： `react-native init TodoApp`

CocoaPods 依赖总是安装失败
网络环境堪忧！你应该知道是什么原因吧！
切换到清华的源：

```bash
cd ~/.cocoapods/repos 
pod repo remove master
git clone https://mirrors.tuna.tsinghua.edu.cn/git/CocoaPods/Specs.git master
```

cocoaPods 镜像有500+M，默认的 git 设置报错:
`error: RPC failed; curl 18 transfer closed with outstanding read data remaining`
究其原因是因为curl的postBuffer的默认值太小，我们需要调整它的大小，在终端重新配置大小
解决方法：
`git config --global http.postBuffer 824288000`

在 ios 目录下的 podFile 加一句：
`source 'https://mirrors.tuna.tsinghua.edu.cn/git/CocoaPods/Specs.git'`

在 ios 目录，`pod install`

在项目跟目录，运行 `react-native run-ios` 启动应用：

在模拟器中，使用`cmd+R` 刷新页面。

### 开发

#### 第一个页面

```js
import React, { Component } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView keyboardShouldPersistTaps="always" style={styles.content}>
          <Text>Hello, React Native!</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3333f"
  },
  content: {
    flex: 1,
    paddingTop: 60
  }
});
```

调试菜单: `cmd + D`


#### 最小宽度

```js
import {PixelRatio} from "react-native";
const minWidth = 1 / PixelRatio.get(),
```

在 StyleSheet 中使用 minWidth

#### 多个样式

```js
<View style={[styles.A, styles.B]} ></View>
```

#### 启动报错
执行：`react-native run-android` 报错

```bash
Could not install the app on the device, read the error above for details.
Make sure you have an Android emulator running or a device connected and have
set up your Android development environment:
https://facebook.github.io/react-native/docs/getting-started.html
```

解决办法：项目的根目录下执行：`chmod 755 android/gradlew`

#### hot reload 突然无法工作：

`rm -rf .git/index.lock`

#### 关于使用第三方依赖包
如果一个包能解决这类问题，但你想要的效果没法直接从文档中得到，这时候，一定要去看源码，一定要去看源码，一定要去看源码。说不定会有惊喜呢，大概率会有的！


### 
7月完
动荡的7月
8月开始