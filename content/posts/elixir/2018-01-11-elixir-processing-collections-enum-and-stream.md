---
title: "elixir processing collections -- enum and stream"
date: 2018-01-11 22:56:26 +0800 
tags: ["elixir"]
---

## Processing Collections -- Enum and Stream


Elixir 有很多表现为 Collections 的类型，比如 lists, maps, ranges, files, 甚至函数也是。

Collections  的实现各有不同，不过都有个相似的特征：均可以遍历。有大部分还可以添加元素。

Elixir 中有两个模块提供了一系列遍历的函数。 Enum 模块，你总会用到它。Stream 模块，可以惰性枚举 collection，意思是你需要时才进行计算。


### Enum -- Processing Collections

Elixir 中 Enum 模块用的超多，用他来 iterate, filter, combine, split 还有其他集合操作。


- 将 collection 转为 list:
`iex> list = Enum.to_list 1..5`

- 合并 collections：
`iex> Enum.concat([1, 2, 3], [4, 5, 6])`
`iex> Enum.concat([1, 2, 3], 'abc')

- 遍历操作元素：
`iex> Enum.map(list, &(&1 * 10))`
`iex> Enum.map(list, &String.duplicate("*", &1))

- 选取值：

```elixir
iex> Enum.at(10..20, 3)
iex> Enum.at(10..20, 20)
iex> Enum.at(10..20, 20, :no_one_here)
iex> Enum.filter(list, &(&1 > 2))
iex> require Integer
iex> Enum.filter(list, &Integer.is_even/1)
iex> Enum.reject(list, &Integer.is_even/1)
```

- 排序比较：

```elixir
iex> Enum.sort ["there", "was", "a", "crooked", "man"]
["a", "crooked", "man", "there", "was"]
iex> Enum.sort ["there", "was", "a", "crooked", "man"],
...> &(String.length(&1) <= String.length(&2)) ["a", "was", "man", "there", "crooked"]
iex(4)> Enum.max ["there", "was", "a", "crooked", "man"]
"was"
iex(5)> Enum.max_by ["there", "was", "a", "crooked", "man"], &String.length/1 
"crooked"
```

- 拆分：

```elixir
iex> enum.take(list, 3)
iex> Enum.take_every list, 2
iex> Enum.take_while(list, &(&1 < 4))
iex> Enum.split(list, 3)
iex> Enum.split_while(list, &(&1 < 4))
```

- 连接
`iex> Enum.join(list)`
`iex> Enum.join(list, ",")`

- 判断

```elixir
iex> Enum.all?(list, &(&1 < 4))
iex> Enum.any?(list, &(&1 < 4))
iex> Enum.member?(list, 4)
iex> Enum.empty?(list)
```

- 汇合(Merge)
`iex> Enum.zip(list, [:a, :b, :c])`
`iex> Enum.with_index(['once", "upon", "a", "time"])`

- 聚集(Fold)

```elixir

iex> Enum.reduce(1..100, &(&1+&2))
5050
Enum.reduce(["now", "is", "the", "time"],fn word, longest ->
  if String.length(word) > String.length(longest) do
    word
  else
    longest
  end
end)
"time"

Enum.reduce(["now", "is", "the", "time"], 0, fn word, longest -> 
  if String.length(word) > longest,
    do: String.length(word), 
  else: longest
end)
```


- 来打牌：

```elixir
import Enum

deck = for rank <- '23456789TJQKA', suit <- 'CDHS', do: [suit, rank]
# => ['C2', 'D2', 'H2', 'S2', 'C3', ... ]

deck |> shuffle |> take(13)
# => ['DQ', 'S6', 'HJ', 'H4', 'C7', 'D6', 'SJ', 'S9', 'D7', 'HA', 'S4', 'C2', 'CT']

hands = deck |> shuffle |> chunk(13)
# => [
['D8', 'CQ', 'H2', 'H3', 'HK', 'H9', 'DK', 'S9', 'CT', 'ST', 'SK', 'D2', 'HA'],
['C5', 'S3', 'CK', 'HQ', 'D3', 'D4', 'CA', 'C8', 'S6', 'DQ', 'H5', 'S2', 'C4'], 
['C7', 'C6', 'C2', 'D6', 'D7', 'SA', 'SQ', 'H8', 'DT', 'C3', 'H7', 'DA', 'HT'], 
['S5', 'S4', 'C9', 'S8', 'D5', 'H4', 'S7', 'SJ', 'HJ', 'D9', 'DJ', 'CJ', 'H6']]
```


### Streams -- lazy Enumerables

Enum 模块，是即时计算的，你传给他一个 collection，它马上返回一个你需要的 collection。

```elixir
[ 1, 2, 3, 4, 5 ]
|> Enum.map(&(&1*&1))
|> Enum.with_index
|> Enum.map(fn {value, index} -> value - index end) 
|> IO.inspect 
#=> [1,3,7,13,21]
```

来看另外一个例子：

从一个文件中，从一个文件中读取内容，返回最长的单词。

```elixir
IO.puts File.read!("/usr/share/dict/words")
  |> String.split
  |> Enum.max_by(&String.length/1)
```

上面的程序会将整个文件的内容读入内存，然后将单词分割，然后找出最长的单词。
这种处理方式会很浪费资源，每次调用都会读取一个 collection 并返回一个 collection。

我们想要的是只在我们需要时才处理集合中的元素，我们没必要存储中间集合结果，只需将当前的元素从一个函数传到另一个。
这就是 Stream 做的事。

#### A Stream Is a Composable Enumerator

直接看栗子：

```elixir
iex> s = Stream.map [1, 3, 5, 7], &(&1 + 1)
#Stream<...>
```

当使用 `Stream.map` 时，不会立即返回 `[2, 4, 6, 8]` 的结果，而是返回一个 stream 值。
那咋子时候才能拿到我们需要的结果？把它当做一个 collection 然后作为参数传给 Enum 模块：

`iex> s = Stream.map [1, 3, 5, 7], &(&1 + 1)`
`iex> Enum.to_list s`

streams 是可以枚举的，你还可以把 stream 传给 stream, 所以 stream 也是可以组成的。

```elixir

iex> squares = Stream.map [1, 2, 3, 4], &(&1*&1) #Stream<[enum: [1, 2, 3, 4],
         funs: [#Function<32.133702391 in Stream.map/2>] ]>
iex> plus_ones = Stream.map squares, &(&1+1) #Stream<[enum: [1, 2, 3, 4],
         funs: [#Function<32.133702391 in Stream.map/2>,
                #Function<32.133702391 in Stream.map/2>] ]>
iex> odds = Stream.filter plus_ones, fn x -> rem(x,2) == 1 end #Stream<[enum: [1, 2, 3, 4],
         funs: [#Function<26.133702391 in Stream.filter/2>,
                #Function<32.133702391 in Stream.map/2>,
                #Function<32.133702391 in Stream.map/2>] ]>
iex> Enum.to_list odds [5, 17]
```

当然，实际应用中，我们这么写：

```elixir
[1,2,3,4]
|> Stream.map(&(&1*&1))
|> Stream.map(&(&1+1))
|> Stream.filter(fn x -> rem(x,2) == 1 end) 
|> Enum.to_list
```

注意，我们这里没有创建临时的 lists，我们只是将 collections 的元素不断的传递到下一个链。
链式的 streams 就像一列函数，每个函数都会作用于 stream 的元素

不只是 lists，越来越多其他 Elixir 模块也支持 Stream。
比如：

```elixir
IO.puts File.open!("/usr/share/dict/words")
  |> IO.stream(:line)
  |> Enum.max_by(&String.length/1)
```

`IO.stream` 将 IO 设备转化为 stream，使其可以在一个时间点只使用一行。当然这么常用的东西，肯定有简写：
`IO.puts File.stream!("/usr/share/dict/words") |> Enum.max_by(&String.length/1)`

不过呢，这样写的好处是这里同样没有临时存储，不好的是它比 Enum 版本慢了2倍。
然而，实际编程中，我们常常会从远程的服务器或者外部的传感器读取数据，连续的数据行缓缓而来，甚至是源源不断，使用 Enum 的话，
我们就得等到所有的数据行接收完成之后才能进行处理，使用 streams 的话，数据随到随处理。

### Infinite Streams

因为 streams 是惰性的。不需要提前拿到整个 collection。举个例子，如果这样：
`iex> Enum.map(1..10_000_000, &(&+1)) |> Enum.take(5)`
`[2, 3, 4, 5, 6]`
需要 等待 8s 左右才看到结果。如果这样写：
`iex> Stream.map(1..10_000_000, &(&1+1)) |> Enum.take(5)`
结果会连续的输出。

### Creating Your Own Streams

在 Elixir 中，Streams 是独立实现地，没有其他运行时支持。但并不简单，而且你可能用到 cycle, repeatedly,iterate,unfold, resource等等好多函数。

#### Stream.cycle

`Stream.cycle` 使用可枚举的参数，返回一个包含了可枚举元素的 infinite stream。当他到达尾部，又会重头开始，无线循环。
看这个例子:

```elixir
Stream.cycle(~w{green white}) 
  |> Stream.zip(1..5)
  |> Enum.map(fn {class, value} -> ~s{<tr class="#{class}"><td>#{value}</td></tr>\n} end)
  |> IO.puts

# => 
<tr class="green"><td>1</td></tr>
<tr class="white"><td>2</td></tr>
<tr class="green"><td>3</td></tr>
<tr class="white"><td>4</td></tr>
<tr class="green"><td>5</td></tr>
```

#### Stream.repeatedly

`Stream.repeatedly` 的参数为一个函数，然后每次有新数据都会执行这个函数。
`iex> Stream.repeatedly(fn -> true end) |> Enum.take(3)`
`iex> Stream.repeatedly(&:random.uniform/0) |> Enum.take(3)`

#### Stream.iterate

`Stream.iterate(start_value, next_fun)` 生成一个 infinite stream，
第一个值是 `start_value`，下一个值是 `next_fun` 以该值为参数执行后的返回值。
无限执行下去。

来看个例子：

```elixir
iex> Stream.iterate(0, &(&1+1)) |> Enum.take(5)
[0, 1, 2, 3, 4]
iex> Stream.iterate(2, &(&1*&1)) |> Enum.take(5)
[2, 4, 16, 256, 65536]
iex> Stream.iterate([], &[&1]) |> Enum.take(5)
[[], [[]], [[[]]], [[[[]]]], [[[[[]]]]] ]
```

#### Stream.unfold

`Stream.unfold` 和 `iterate` 是一类的，但是你可以更明确的指明 stream 的输出以及传给下一个函数的值。你提供一个初始值和函数，函数使用参数来返回有两个值的 tuple。
第一个值是该 stream 遍历的返回值，第二个是传给下一个函数的值。如果函数返回 nil，stream 就会结束。

有点抽象，但是 unfold 是很有用的，他用于创建无限的 stream 的值，每个值都是前一个函数执行的结果。

关键是 生成函数，他的一般表示为：

`fn state -> { stream_value, new_state } end`

举个例子，Fibonacci 数的 stream:

`iex> Stream.unfold({0, 1}, fn {f1, f2} -> {f1, {f2, f1 + f2}} end) |> Enum.take(15)`

这儿的 state 是一个 tuple，包含一个当前值和其下一位的值。初始值 为 `{0， 1}`. 每次循环 stream 的返回值为状态值的第一个，然后状态向前走，`{f1, f2}` 变为 `{f2, f1+f2}`。

#### Stream.resource

stream 怎样跟外部的资源交互？我们已经试过从文件中读取数据行到 stream 中，那你如何自己实现呢？
你需要在 stream 开始时打开文件，返回连续的数据行，然后关闭文件。或者你想将数据库中的结果集放进 stream 的值呢？
你需要在 stream 开始时执行查询语句，以 stream 的返回值返回数据行，然后关闭查询，这就是 `Stream.resource` 做的事。

`Stream.resource` 构建于 `Stream.unfold` 之上。

unfold 的第一个参数是循环的初始值，不过当这个值为外部资源时，我们想让其在 stream 开始时才获取值，为此，resource 第一个参数接收一个函数，该函数返回这个值。

当 stream 完成时，我们想让资源关闭。这是第三个参数的作用，这个函数可以拿到最终的值并且可以操作外部资源。

```elixir
Stream.resource(fn -> File.open!("sample") end,
  fn file -> 
    case IO.read(file, :line) do
      data when is_binary(data) -> {[data], file}
      _ -> {:halt, file}
    end
  end,
  fn file -> File.close(file) end
)
```

第一个函数在 stream 激活时打开文件，然后将其返回值传给第二个函数，这个函数以行来读取文件，匹配数据行，根据匹配的数据返回 tuple。第三个函数关闭文件。

以 time 为例。我们想实现一个按分钟的倒计时器。使用 stream resource 来完成。

```elixir
# enum/countdown.exs

defmodule Countdown do
  def sleep(seconds) do
    receive do
      after seconds * 1000  -> nil
    end
  end

  def say(text) do
    spawn fn -> :os.cmd('say #{text}') end
  end

  def timer do
    Stream.resource(
      fn -> 
        {_h, _m, s} = :erlang.time
        60 - s - 1
      end,
      fn 
        0 -> 
          {:halt, 0}
        count ->
          sleep(1)
          { [inspect(count)], count - 1}
      end,
      fn _ -> nil end
    )
  end
end
```

玩一哈：

```elixir
$ iex countdown.exs
iex> counter = Countdown.timer
#Function<17.133702391 in Stream.resource/3>
iex> printer = counter |> Stream.each(&IO.puts/1) #Stream[enum: #Function<17.133702391 in Stream.resource/3>,
funs: [#Function<0.133702391 in Stream.each/2>] ]>
iex> speaker = printer |> Stream.each(&Countdown.say/1) #Stream[enum: #Function<17.133702391 in Stream.resource/3>,
 funs: [#Function<0.133702391 in Stream.each/2>,
  #Function<0.133702391 in Stream.each/2>] ]>

iex> speaker |> Enum.take(5)
```

然后你就会听到你的电脑倒计时读秒数了，没有听到的话找到你电脑系统对应的 say 命令（say 是 MacOS 的）.

#### Streams in Practice

函数式编程需要你以一种全新的视角来看问题，而 stream 同样让你以另一种方式来对待循环和集合。不是每个循环都需要 stream，但是当你需要延迟执行时或者需要处理大量数据时，你该考虑使用 stream。

### The Collectable Protocol

`Enumerable` 提供了遍历集合元素的接口。`Collectable` 则是相反的操作，插入元素构建集合。

不是所有的集合都可以 collectable。比如 Ranges，就不能插入新元素。

collectable API 是相当底层的，一般你会使用 `Enum.into` 来访问它。

将 range 的元素注入 list。
`iex> Enum.into 1..5, []`

当 list 不为空时，新元素会加入 list 的尾部：
`iex> Enum.into 1..5, [100, 101]`
`#=> [100, 101, 1, 2, 3, 4, 5]`


### Comprehensions

函数式代码，少不了写 map 和 filter，Elixir 提供了 comprehension 来简化他们的写法。
comprehension 的想法很简单：给定一个或者多个集合，取出每个元素，过滤值，然后用过滤后的值组成新的集合。
一般形式：

`result = for generator or filter...[, into: value], do: expression`

来看看具体的例子：

```elixir
iex> for x <- [1, 2, 3, 4, 5], do: x * x
[1, 4, 9, 16, 25]
iex> for x <- [1, 2, 3, 4, 5], x < 4, do: x * x
```

从集合中取值，可以使用模式匹配。

`pattern <- enumerable_thing`

任何匹配的值都会用于 comprehension 后面的部分。比如 `x <- [1, 2, 3]`， x 会依次设为 1， 2， 3等值。
如果值生成器为两个，则后面操作的值是嵌套的，
比如` x <- [1, 2], y <- [5, 6]`，之后的执行则是： `x = 1, y, = 5, x = 1, y = 6, x = 2, y = 5, x = 2, y = 6`,
跟循环嵌套一个道理。

```elixir
iex> for x <-[1,2] , y <- [5,6], do: x*y 
[5, 6, 10, 12]
iex> for x <- [1,2], y <- [5,6], do: {x, y} 
[{1, 5}, {1, 6}, {2, 5}, {2, 6}]
```

前面生成器中的变量可以在后面的生成器中使用：

```elixir
iex> min_maxs = [{1, 4}, {2, 3}, {10, 15}]
[{1, 4}, {2, 3}, {10, 15}]
iex> for {min, max} <- min_maxes, n <- min..max, do: n
[1, 2, 3, 4, 2, 3, 10, 11, 12, 13, 14, 15]
```

filter，过滤掉不符合要求的值，符合条件的值才进入余下的部分执行。

看个例子：

```elixir
iex> first8 = [1, 2, 3, 4, 5, 6, 7, 8]
[1, 2, 3, 4, 5, 6, 7, 8]
iex> for x <- first8, y <- first8, x >= y, rem(x*y, 10) == 0, do: {x, y}
[{5, 2}, {5, 4}, {6, 5}, {8, 5}]
```

由于生成器的第一部分为模式匹配，所以可以用其来解构结构化的数据。
比如：

```elixir
iex> reports = [ dallas: :hot, minneapolis: :cold, dc: :muggy, la: :smoggy ]
[dallas: :hot, minneapolis: :cold, dc: :muggy, la: :smoggy]
iex> for { city, weather } <- reports, do: { weather, city }
[hot: :dallas, cold: :minneapolis, muggy: :dc, smoggy: :la]
```

#### Comprehensions Work on Bits, Too

位串（二进制或者字符串）也是集合，所以 comprehension 同样适用。

```elixir
iex> for << ch <- "hello" >>, do: ch 
'hello'
iex> for << ch <- "hello" >>, do: <<ch>> 
["h", "e", "l", "l", "o"]
```

这里生成器被包在了`<<>>`里面，说明是二进制。
第一个例子，do 块返回字符的 ASCII 码数字，结果为 `[104, 101, 108, 108, 111]`，不过在 iex 中展示为 'hello'。
第二个例子则是将数字转化为字符，所以是一个一个字符的列表。

重申下，`<-` 左边为模式匹配，所以可以使用二进制模式匹配。来看看将 string 转为八进制表示的字符串：

```elixir
iex> for << << b1::size(2), b2::size(3), b3::size(3) >> <- "hello" >>, 
...> do: "0#{b1}#{b2}#{b3}"
["0150", "0145", "0154", "0154", "0157"]
```

#### Scoping and Comprehensions

所有变量都只在 comprehension 内部有效，外面访问不到的。

#### The Value Returned by a Comprehension

在之前的例子中，comprehension 返回的是 list，list 中的元素为 do 表达式执行的结果。

这种行为可以被 `into:` 参数改变。`into:` 可以指定一个集合，然后 do 表达式循环执行的结果都将保存到这个集合。

```elixir
iex> for x <- ~w{cat dog}, into: %{}, do: {x, String.upcase(x)}
%{"cat" => "CAT", "dog" => "DOG"}
# or
iex> for x <- ~w{ cat dog }, into: Map.new, do: { x, String.upcase(x) }
%{"cat" => "CAT", "dog" => "DOG"}
# 这个集合不要求为空
iex> for x <- ~w{ cat dog }, into: %{"ant" => "ANT"}, do: { x, String.upcase(x) } 
%{"ant" => "ANT", "cat" => "CAT", "dog" => "DOG"}
```

`into:` 可以接受哪些值呢？只要实现了 Collectable 接口的都行，包括 lists, binaries, functions, maps, files, hash dicts, hash sets, IO streams 等等，

```elixir
iex> for x <- ~w{ cat dog }, into: IO.stream(:stdio,:line), do: "<<#{x}>>\n" 
<<cat>>
<<dog>>
%IO.Stream{device: :standard_io, line_or_bytes: :line, raw: false}
```


