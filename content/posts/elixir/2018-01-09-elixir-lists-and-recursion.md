---
title: "elixir lists and recursion"
date: 2018-01-09 22:56:26 +0800 
categories: elixir
tag: elixir
---

## Lists and Recursion

### Heads and Tails

之前我们说过，一个 list 可能为空 或者 有一个 head 和 一个 tail。head 为一个值，tail 则是剩下的 list。这是符合递归定义的。

假设我们用管道符号 `|` 来把 head 和 tail 分开，那`[3]` 可以表示为：`[3 | [] ]`,
分隔符左边为 head 或者一个 list ，右边为 tail。
`[2, 3] => [2 | [3 | [] ] ]`
`[1, 2, 3] => [1 | [2 | [3 | [] ] ] ]`
`...`

是不是有点感觉了。

其实这在 Elixir 中是合法的。
`iex> [ 1 | [ 2 | [ 3 | [] ] ] ]     #=> [1, 2, 3]`

来了啊，list 是可以进行模式匹配的。
所以：

```elixir
iex> [ head | tail ] = [1, 2, 3]
[1, 2, 3]
iex> head
1
iex> tail
[2, 3]
```

### Using Head and Tail to Process a List

函数式 递归 的 思想 很奇妙！
来看个问题，写个函数 算出 list 的长度。
list 为空时长度为0
list 不为空时 长度 等于 tail 的长度加1

```elixir
# lists/mylist.exs

defmodule MyList do
  def len([]), do: 0
  def len([head|tail]), do: 1 + len(tail)
end
```

有了之前的基础相信上面的代码很好理解，最好把程序运行起来验证一样。

上面的程序会出来一个警告，因为我们没有使用到 head 的值，所以可以用占位符来替代 head，用 `_ or _head` 都可以，下划线开头就行。

### Using Head and Tail to Build a List

来看看另一个例子，一个函数接收一组数字，返回每个元素平方后的数组。
JS 可以这样实现:

```javascript
function square(arr) {
  return arr.map( el => el * el)
}
```

Elixir:

```elixir
def square([]), do: []
def square([head | tail]), do: [head*head | square(tail)]
```

Elixir 真是将递归思想发扬光大啊！

再举个例子：

```elixir
lists/mylist1.exs
def add_1([]), do: []
def add_1([ head | tail ]), do: [ head+1 | add_1(tail) ]
```

### Creating a Map Function

如上形式，可以归为一类。这就是 map，我们来实现以下：

```elixir
def map([], _func), do: []
def map([ head | tail], func), do: [func.(head) | map(tail, func)]
```

map 有多常用有多好用，不需要再说了吧。

### Keeping Track of Values During Recursion

有 map 自然就有 reduce，所有元素求和。
使用 JS :

```javascript
function sum( arr ) {
  return arr.reduce( (sum, el) => sum + el )
}
```

Elixir:

```elixir
defmodule MyList do
  def sum([], total), do: total
  def sum([ head | tail], total), do: sum(tail, head+total)
end
```

Elixir 提倡用下面的形式：

```elixir
defmodule MyList do
  def sum(list), do: _sum(list, 0)
  defp _sum([], total), do: total
  defp _sum([head | tail ], total), do: _sum(tail, head+total)
end
```

### Generalizing Our Sum Function

一般形式的 reduce 实现，如果不知道 reduce 是啥，先找其他语言的 reduce (比如 JS 的，因为 JS 的文章多啊)学习，自然就好理解了：

```elixir
defmodule MyList do
  def reduce([], value, _) do
    value
  end
  def reduce([head | tail], value, func) do
    reduce(tail, func.(head, value), func)
  end 
end
```

### More Complex List Patterns

连接符号 `|` 的左侧可以允许有多个值。所以可以这样写：

```elixir
iex> [ 1, 2, 3 | [4, 5, 6] ]
[1, 2, 3, 4, 5, 6]
```

来看看这个问题，将一个数组中的元素两两调换位置。

```elixir
defmodule Swapper do
  def swap([]), do: []
  def swap([ a, b | tail ]), do: [ b, a | swap(tail) ]
  def swap([_]), do: raise "Can't swap a list with an odd number of elements"
end
```

#### Lists of Lists

假设我们有如下数据结构的记录若干，我们要从中挑选 location_id 为 27 的数据。
`[ timestamp, location_id, temperature, rainfall ]`

```elixir
defmodule WeatherHistory do
  def for_location_27([]), do: []
  def for_location_27([[time, 27, temp, rain] | tail]) do
    [ [time, 27, temp, rain] | for_location_27(tail)]
  end
  def for_location_27([ _ | tail]), do: for_location_27(tail)

  def test_data do
    [
      [1366225622, 26, 15, 0.125],
      [1366225622, 27, 15, 0.45],
      [1366225622, 28, 21, 0.25],
      [1366229222, 26, 19, 0.081],
      [1366229222, 27, 17, 0.468],
      [1366229222, 28, 15, 0.60],
      [1366232822, 26, 22, 0.095],
      [1366232822, 27, 21, 0.05],
      [1366232822, 28, 24, 0.03],
      [1366236422, 26, 17, 0.025]
    ]
  end
end
```

跑起来看看对不对：

```elixir
iex> c "weather.exs"
[WeatherHistory]
iex> import WeatherHistory
WeatherHistory
iex> for_location_27(test_data)
[[1366225622, 27, 15, 0.45], [1366229222, 27, 17, 0.468], [1366232822, 27, 21, 0.05]]
```

通是通了，不过这样写函数是不太灵活的，可以把 27 用变量来替换：

```elixir
defmodule WeatherHistory do
  def for_location([], _target_loc), do: []
  def for_location([ [time, target_loc, temp, rain] | tail], target_loc) do
    [ [time, target_loc, temp, rain] | for_location(tail, target_loc) ]
  end
  def for_location([ _ | tail], target_loc), do: for_location(tail, target_loc)
end
```

模式的模式匹配，这些牛逼了。

```elixir
defmodule WwatherHistory do
  def for_location([], _target_loc), do: []
  def for_location([ head = [_, target_loc, _, _] | tail], target_loc) do
    [ head | for_location(tail, target_loc) ]
  end
  def for_location([ _ | tail], target_loc), do: for_location(tail, target_loc)
end
```

第二段，参数匹配是 匹配 第二个元素为指定的 target_loc 的 list 然后将其匹配为 head。


### The List Module in Action

List 模块提供了操作 list 的工具函数集。

```elixir
iex> [1, 2, 3] ++ [4, 5, 6]
[1, 2, 3, 4, 5, 6]

iex> List.flatten([ [ [1], 2], [ [ [3]]]])
[1, 2, 3]

iex> List.foldl([1, 2, 3], "", fn value, acc -> "#{value}(#{acc})" end)
"3(2(1()))"

iex> List.foldr([1, 2, 3], "", fn value, acc -> "#{value}(#{acc})" end)
"1(2(3()))"

iex> list = [1, 2, 3]
[1, 2, 3]
iex> List.replace_at(list, 2, "buckle my shoe")
[1, 2, "buckle my shoe"]

iex> kw = [{:name, "Dave"}, {:likes, "Programming"}, {:where, "Dallas", "TX"}]
iex> List.keyfind(kw, "Dallas", 1)
{:where, "Dallas", "TX"}
iex> List.keyfind(kw, "TX", 2)
{:where, "Dallas", "TX"}
iex> List.keyfind(kw, "TX", 1)
nil
iex> List.keyfind(kw, "TX", 1, "No city called TX")
"No city called TX"
iex> kw = List.keydelete(kw, "TX", 2)
[name: "Dave", likes: "Programming"]
iex> kw = List.keyreplace(kw, :name, 0, {:first_name, "Dave"})
[first_name: "Dave", likes: "Programming"]
```

