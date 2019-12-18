---
title: React 复习
date: 2019-07-02 11:11:11
tags:
  - JavaScript
  - React
---

# React 读书笔记

背景，正在学习 《Manning.React.Native.in.Action.2019.3》

## 第二章 理解 React

### 使用 State 管理组件数据

1. 组件使用 state 来管理组件数据，组件的 state 在组件创建后声明，结构是空的 JS 对象。使用 setState 函数来更新状态。另一种持有数据的方式是通过 props，在组件被创建后通过参数传递，组件内最好不要直接修改 props。
2. State 是组件管理的值的集合。React 认为 UI 就是简单的状态机。当组件通过 setState 函数来改变状态时，就会重新渲染组件。同时通过 props 沿用了该状态的所有子组件都将重新渲染。

#### 设置初始 state

有两种方式来设置 state

1. 通过 state 属性

```js
import React from "react";

class MyComponent extends React.Component {
  state = { year: 2016, name: "Nader Dabit", colors: ["blue"] };

  render() {
    return (
      <View>
        <Text>My name is: {this.state.name}</Text>
        <Text>The year is: {this.state.year}</Text>
        <Text>My colors are {this.state.colors[0]}</Text>
      </View>
    );
  }
}
```

2. 通过 JS 的构造函数 constructor

```js
import React {Component} from 'react'

class MyComponent extends Component {
  constructor(){
    super()
    this.state = { year: 2016, name: 'Nader Dabit', colors: ['blue'] }
  }
  render() {
    return (
      <View>
        <Text>My name is: { this.state.name }</Text>
        <Text>The year is: { this.state.year }</Text>
        <Text>My colors are { this.state.colors[0] }</Text>
      </View>
    )
  }
}
```

#### setState 的用法

通过例子来理解 setState 的用法，onPress 相当于 onClick

```js
import React {Component} from 'react'

class MyComponent extends Component {
  constructor(){
    super()
    this.state = { year: 2016, }
  }
  updateYear() {
    this.setState({ year: 2017 })
  }
  render() {
    return (
      <View>
        <Text onPress={() => this.updateYear()}>
          The year is: { this.state.year }
        </Text>
      </View>
    )
  }
}
```

setState 是通过 merge 的方式来更新属性的值，也就是只会改变 setState 中设置的值，state 中其他的值不会受影响。只有通过 setState 改变的属性才能重新渲染组件，直接修改属性的值是不会触发重新渲染的。
还有一种强制重新渲染，通过调用 forceUpdate，但这种方式不常用，也不推荐使用。

再看个复杂的例子：

```js
class MyComponent extends Component {
  constructor() {
    super();
    this.state = {
      year: 2016,
      leapYear: true,
      topics: ["React", "React Native", "JavaScript"],
      info: { paperback: true, length: "335 pages", type: "programming" }
    };
  }
  render() {
    let leapyear = <Text>This is not a leapyear!</Text>;
    if (this.state.leapYear) {
      leapyear = <Text>This is a leapyear!</Text>;
    }
    return (
      <View>
        {" "}
        <Text>{this.state.year}</Text>{" "}
        <Text>Length: {this.state.info.length}</Text>{" "}
        <Text>Type: {this.state.info.type}</Text> {leapyear}{" "}
      </View>
    );
  }
}

```

都是很常用的用法。

### 使用 props 管理组件数据

props 是从父组件继承的值或属性。
记住在组件内是不可变的，除非在最上层定义的地方去修改。
React 组件是核心，组件的使用自然会形成父子组件关系，props 就是父子组件关系的核心。

一个简单的例子：

```js
class MyComponent extends Component {
  render() {
    return <BookDisplay book="React Native in Action" />;
  }
}
class BookDisplay extends Component {
  render() {
    return (
      <View>
        {" "}
        <Text>{this.props.book}</Text>{" "}
      </View>
    );
  }
}
```

这里的父组件是 MyComponent，子组件是 BookDisplay，父组件创建子组件 BookDisplay 时，通过book这个属性，将值 'React Native in Action' 传递给子组件，子组件使用 `this.props.book` 引用该值进行显示。
上面的例子传递的是静态的值，来看看动态属性的例子：

```js
class MyComponent extends Component {
  constructor() {
    super();
    this.state = { book: "React Native in Action" };
  }
  render() {
    return <BookDisplay book={this.state.book} />;
  }
}
class BookDisplay extends Component {
  render() {
    return (
      <View>
        {" "}
        <Text>{this.props.book}</Text>{" "}
      </View>
    );
  }
}
```

形式相同，只是父组件传递的值是动态的。
再增加点复杂度，父组件传递值，和更新该值的函数给子组件，子组件监听事件，并调用该函数。

```js
class MyComponent extends Component {
  constructor() {
    super();
    this.state = { book: "React Native in Action" };
  }
  updateBook() {
    this.setState({ book: "Express in Action" });
  }
  render() {
    return (
      <BookDisplay
        updateBook={() => this.updateBook()}
        book={this.state.book}
      />
    );
  }
}

class BookDisplay extends Component {
  render() {
    return (
      <View>
        {" "}
        <Text onPress={this.props.updateBook}> {this.props.book} </Text>{" "}
      </View>
    );
  }
}

```

小技巧，使用 ES6 的解构，减少代码量，`this.state.somekey` 和 `this.props.somekey` 使用的非常非常多，这个时候可以用解构简写，比如：`const {book, updateBook} = this.props` 之后就可以直接使用 book 和 updateBook 变量名了。

```js
class BookDisplay extends Component {
  render() {
    const { book, updateBook } = this.props;
    return (
      <View>
        {" "}
        <Text onPress={updateBook}> {book} </Text>{" "}
      </View>
    );
  }
}
```

#### stateless 组件，无状态组件
无状态组件只关心 props，不存在组件自身的状态。对组件的复用有很多帮助。
无状态组建的优点：1. 代码简洁。2.性能更好。

```js
const BookDisplay = props => {
  const { book, updateBook } = props;
  return (
    <View>
      <Text onPress={updateBook}> {book} </Text>
    </View>
  );
};

// 或者
const BookDisplay = ({ book, updateBook }) => {
  return (
    <View>
      <Text onPress={updateBook}> {book} </Text>
    </View>
  );
};
```

看起来好舒服多了，谁赞成，谁反对？

### 组件规范

首先来看`render,constructor,statics` 这3个组件规范。

#### render 用于创建UI
创建组件唯一必须的函数。

其返回值有且只有3种：单一的元素，null， false。
举例：

```js
  render() {
    return (
      <View>
        <Text>Hello</Text>
      </View>
    );
  }
```

#### 属性初始化器和构造函数

属性初始化器是 ES7 的语法，上面有介绍。
构造函数是 ES6 的语法，使用构造函数需要调用 super 方法。
用 props 初始化 state 的值，不是一个很好的实践，需要避免。


### 组件生命周期函数

生命周期函数，在组件的生命周期中各种关键点执行的函数。
React 的生命周期函数分为3个阶段，

- Mounting(创建)阶段，函数有：constructor, getDerivedStateFromProps, render, and componentDidMount.
- Updating 阶段，函数有：getDerivedStateFromProps (when props change), shouldComponentUpdate, render, getSnapshotBeforeUpdate, and componentDidUpdate
- Unmounting 阶段，函数有：componentWillUnmount

#### getDerivedStateFromProps 静态函数
这个函数在组件创建后和props更新后都会调用。此方法接收新的props和最新的 state 作为参数并返回一个对象。对象中的数据更新为状态。

看个栗子：

```js
export default class App extends Component {
  state = { userLoggedIn: false };
  static getDerivedStateFromProps(nextProps, nextState) {
    if (nextProps.user.authenticated) {
      return { userLoggedIn: true };
    }
    return null;
  }
  render() {
    return (
      <View style={styles.container}>
        {this.state.userLoggedIn && <AuthenticatedComponent />}
      </View>
    );
  }
}
```

#### componentDidMount 函数
只调用一次，在组件 mount 后。常用于 ajax 请求获取数据。
例子：

```js
class MainComponent extends Component {
  constructor() {
    super();
    this.state = { loading: true, data: {} };
  }
  componentDidMount() {
    //simulate ajax call
    setTimeout(() => {
      this.setState({ loading: false, data: { name: "Nader Dabit", age: 35 } });
    }, 2000);
  }
  render() {
    if (this.state.loading) {
      return <Text>Loading</Text>;
    }
    const { name, age } = this.state.data;
    return (
      <View>
        <Text>Name: {name}</Text>

        <Text>Age: {age}</Text>
      </View>
    );
  }
}
```

#### shouldComponentUpdate 函数
这个函数返回的是 Boolean 值，允许你决定是否该组件。
你可以根据对比新旧props，或者新旧 state，来返回 true 或者 false。

```js
class MainComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.name !== this.props.name) {
      return true;
    }
    return false;
  }
  render() {
    return <SomeComponent />;
  }
}
```

#### componentDidUpdate 函数
在组件被更新并重新渲染后调用。参数为更新之前的 props 和 state。

```js
class MainComponent extends Component {
  componentDidUpdate(prevProps, prevState) {
    if (prevState.showToggled === this.state.showToggled) {
      this.setState({ showToggled: !showToggled });
    }
  }
  render() {
    return <SomeComponent />;
  }
}
```

#### componentWillUnmount 函数
当该组件从应用中移除之前调用。可以在这里做一些清理操作，比如移除事件监听，清理 timer 等。

```js
class MainComponent extends Component {
  handleClick() {
    this._timeout = setTimeout(() => {
      this.openWidget();
    }, 2000);
  }
  componentWillUnmount() {
    clearTimeout(this._timeout);
  }
  render() {
    return <SomeComponent handleClick={() => this.handleClick()} />;
  }
}
```

### 总结
- State 是 React 组件处理数据的一种方式。更新 State 就会更新UI。
- props 是父子组件传递数据的一种方式。同样更新props，子组件也会更新。
- React 组件规范是一组函数和属性，render 是唯一必须的函数。
- 生命周期函数分为3个阶段，mounting、updating、unmounting。

完