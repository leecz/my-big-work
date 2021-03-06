---
title: Pattern Matching 
date: 2018-12-24 23:54:57
tags: ["elixir"]
---

## Pattern Matching

### Assignment
elixir 的赋值不是一般的赋值
'=' 在 elixir 中是匹配操作
比如 `a = 1` 左边是一个变量，右边是一个整数，这是符合匹配的逻辑的，所以就把1赋值给a变量了, 好吧，这就是赋值。
再看：`1 = a` 这在其他语言应该会报错，但是elixir 是不会的，因为 `=` 是匹配操作，左右两边都是1，当然能匹配啦。
再看`2 = a`，报错，因为相当于`2 = 1`不匹配啦。

### 稍微复杂点的匹配
个人理解，跟 ES6 中的解构类似。

#### 列表匹配

```elixir
list = [ 1, 2, 3 ]
[a, b, c] = list //-> a: 1, b: 2, c: 3
```
elixir 会尽量让左边的值与右边的值相等, 这里左边是一个有3个变量的列表，右边是一个有3个值的列表，简直刚刚好，所以刚刚好可以把值赋值给变量。

### 忽略值
使用 `_` 来忽略不需要匹配的值
比如 `[1, _, _] = [1, 2, 3]`

### 变量只绑定一次
在匹配的过程中，如果一个变量已经绑定了一个值，在剩下的匹配中，其值不能被改变。想想为啥子。

```elixir
[a, a] = [1, 2]
// Error...

[b, b] = [1, 1]
[1, 1] 
b //-> 1
```
再看

```elixir
a = 1
[1, a, 3] = [1, 2, 3]
a //-> 2
```
不在同一匹配中，这样是可以的

再看，如果你不想在匹配时改变原有的值，那咋办？
```elixir
a = 1
a = 2
// 上面第二个匹配改变了a原有的值1，变成了2
// 如果不想 a 改变
^a = 1
// 这样 a 就不会改变，还是1，只是这个匹配显然是不成立的，所以会报错
```
这样的操作叫 pin 操作，在不想改变的变量前加`^`

### 总结
在 Elixir 中, 等式 `x = a + 1` 并不是表示把 `a + 1`的值赋值给 x ，而是断言
x 和 `a + 1` 有相同的值。这是不同于其他很多语言的，这也是 Elixir 的核心部分之一，理解了这一点，才能更加顺利的进行之后的学习。



