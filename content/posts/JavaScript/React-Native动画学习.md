---
title: React Native 动画学习
date: 2019-08-06 11:11:11
tags:
  - JavaScript
  - React Native
---


# 动画学习
让生硬的变化变成灵动的变化。


## 记录
使用 react native 的动画，需要 4 步走，敲黑板：

1. 引入 Animated 组件，就跟引入 View 组件一样。
2. 使用 Animated API 创建动画变量.
3. 将动画值赋到样式添加到组件。
4. 使用函数来改变动画变量。

开箱即用的4个组件 `View , ScrollView , Text , Image`



```js
import ScrollableTabView, {
  ScrollableTabBar
} from "react-native-scrollable-tab-view";
        <ScrollableTabView
          style={styles.tabViewWrap}
          tabBarUnderlineStyle={styles.tabUnderline}
          tabBarBackgroundColor="#ffffff"
          tabBarActiveTextColor="#0078c8"
          tabBarInactiveTextColor="#999999"
          tabBarTextStyle={{ fontSize: 15 }}
          renderTabBar={() => (
            <ScrollableTabBar tabsContainerStyle={{ paddingHorizontal: 60 }} />
          )}
        >
          <CompleteReturn
            tabLabel="整退"
            orderNumber={orderNumber}
            inboundId={inboundId}
            wareHouseList={wareHouseList}
            orderList={orderList}
          />
          <PartialReturn
            tabLabel="散退"
            inboundId={inboundId}
            orderNumber={orderNumber}
            wareHouseList={wareHouseList}
          />
        </ScrollableTabView>
```

tabsContainerStyle 这个属性就是通过源码找出来的


安卓9版本将非加密的请求禁掉，去掉这个限制：
在 AndroidManifest.xml 中，
加入

```xml
<application
...
android:usesCleartextTraffic="true"
..
>
```