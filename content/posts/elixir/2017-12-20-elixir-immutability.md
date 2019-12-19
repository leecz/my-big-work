---
title: "elixir immutability and data type"
date: 2017-12-20 22:56:26 +0800 
tags: ["elixir"]
---

## Immutability

Elixir 强制使用不可变数据

### 为什么需要 Immutable

举个例子：

```elixir
array = [1, 2, 3]
do_something_with(array)
print(array)
```

在大多数语言中，你可能不太确定最后打印的 array 是啥子，因为 `do_something_with` 函数接收的是数组的引用，如果函数内改变了数组的内容，则 array 也会变。
更甚者，在多线程中，你永远都不知道他被谁改变了。

### Elixir 中的数据

elixir 规避了所有这些问题，在 elixir 中，所有的值都是不可变的。
如果你想将 `[1, 2, 3]` 中的元素都加上100，怎么办？elixir 将生成一个原数据的拷贝，而原数据不变。

### 不可变性对性能的影响

#### Copying Data

我们都知道复制一份数据是要消耗性能的，相反减少复制能提高性能。因为 Elixir 知道存在的数据是不可变的，可以直接重用，所以在构建新的数据结构时，可以直接引用为新数据的一部分。

```elixir
list1 = [3, 2, 1]
list2 = [ 4 | list1]
[4, 3, 2, 1]
```

在大多数语言中，list2 可能是一个包含4个新元素的数据，其中后面3个由 list1 复制而来。而 Elixir 知道 list1 不会改变，所以 Elixir 直接 将 4 和 list1 组成新的数组。

#### Garbage Collection

对垃圾回收机制不是太熟，但因为也不会影响什么性能，毕竟性能也是 Elixir 的优势。

引用：

> The other performance issue with a transformational language is that you quite often end up leaving old values unused when you create new values from them. This leaves a bunch of things using up memory on the heap, so garbage collection has to reclaim them.
> Most modern languages have a garbage collector, and developers have grown to be suspicious of them—they can impact performance quite badly.
> But the cool thing about Elixir is that you write your code using lots and lots of processes, and each process has its own heap. The data in your application is divvied up between these processes, so each individual heap is much, much smaller than would have been the case if all the data had been in a single heap. As a result, garbage collection runs faster. If a process terminates before its heap becomes full, all its data is discarded—no garbage collection is required.

### 编程中的不可变数据

当你接受了不可变数据的概念之后，使用其编程将是非常简单的事。
只要记住任何函数和数据变换都是返回一个新的拷贝。因此我们不是将字符串的首字符变成大写，而是我们返回一个首字符大写的新的拷贝。

```elixir
name = "elixir"
cap_anme = String.capitalize name
"Elixir"
name
elixir
```

在面向对象的语言中，我们喜欢使用 name.capitalize()，但是在面向对象的语言中，状态是可以改变的，当你调用 name.capitalize() 时，你没法立即确定这个函数是改变了原数据，还是返回了一个新的拷贝，还是两者兼是。
在函数式编程语言中，我们转换数据，但不是在原来的基础上修改。

## Elixir Basics

### Built-in Types

- Value types:
  + Arbitrary-sized integers 整型
  + Floating-point numbers 浮点数
  + Atoms  原子
  + Ranges 范围
  + Regular Expressions 正则
- System types:
  + PIDs and ports
  + References
- Collection types:
  + Tuples
  + Lists
  + Maps
  + Binaries

Functions 也是函数，在后面的专门介绍。
strings 和 structures 是有上面的基础类型构建的，后面专门介绍。
regular expressions 和 ranges 是否是值类型是有争议的，在技术上不是，但可以把他们当做单独的类型。

### Value Type

值类型 在 Elixir 中是 numbers, names, ranges, regular expressions 这几种

#### Integers

整型可以写为 decimal(1234), hexadecimal(0xcafe), Octal(0o765), 和 binary(0b1010)。

decimal umber 可以包含下划线，用于分开巨大的数，比如 `1_000_000`（中日也可以为 `100_0000`）。

整数的大小是不受限制的。

#### Floating-Point Numbers

有小数点的为浮点数，至少有一个小数位。
下面这些都是：
`1.0        0.3333      0.314159e1        314159.0e-5`
浮点数是 IEEE 754 标准双精度，16digits of accuracy，最大 10的308次方。

#### Atoms

Atoms 是常量，表示什么东西的名字。以冒号开头，比如下面的：
`:fred     :is_binary?     :var@2        :<>       :===        :"func/3"     :"long john silver"   `


#### Ranges
start...end 形式的为 Ranges, start 和 end 为整数，跟 ruby 一样。

#### Regular Expressions

Elixir 中的正则表达式为： `~r{regexp}  or  ~r{regexp}opts `

使用：

```elixir
> Regex.run ~r{[aeiou]}, "caterpillar"
["a"]
> Regex.scan ~r{[aeiou]}, "caterpillar"
["a"], ["e"], ["i"], ["a"]]
> Regex.split ~r{[aeiou]}, "caterpillar"
["c", "t", "rp", "ll", "r"]
> Regex.replace ~r{[aeiou]}, "caterpillar", "*"
"c*t*rp*ll*r"
```

### System Types

PIDs and Ports, References 暂时先不说

### Collection Types

#### Tuple

tuple 类似于数组？

可以表示为：
` {1, 2}    { :ok, 42, "next" }  { :error, :enoent }  `
一个典型的 Elixir tuple 有 2 到 4 个元素，多了的话，你可以使用 maps 或 stucts 了。

在 tuple 中使用模式匹配

```elixir
> {status, count, action} = {:ok, 42, "next"}
{ :ok, 42, "next"}
> status
:ok
> count
42
> action
"next"
```

tuple 常用于函数返回值，当没有错误发生时，tuple 的第一个元素为 `:ok`。比如你打开一个文件：
`> {status, file} = File.open("mix.exs")`
`{:ok, #PID<0.39.0>}`

如果发生错误呢?

```elixir
iex> { :ok, file } = File.open("mix.exs")
{:ok, #PID<0.39.0>}
iex> { :ok, file } = File.open("non-existent-file")
** (MatchError) no match of right hand side value: {:error, :enoent}
```

#### Lists

list 不像其他语言的数组，tuple 更像数组。list 是链表结构，所以 list 循序遍历是很简单的操作，而随机访问则代价高昂。

List 有一个特点，记得我们之前所说的所有的 Elixir 数据结构都是不可变的吗？这就意味着一个 list 一旦被创建，它就无法改变了。
所以，如果我们想删除 list 中的第一个元素，留下其余的，我们不必复制整个数组，我们返回指向 tail 的指针（引用）即可。

list 有一些独特的操作：

```elixir
> [1, 2, 3] ++ [4, 5, 6]
[1, 2, 3, 4, 5, 6]
iex> [1, 2, 3, 4] -- [2, 4]
[1, 3]
iex> 1 in [1,2,3,4]
true
iex> "wombat" in [1, 2, 3, 4] false
```

##### Keyword Lists

元素为 key/value 结构的元素很常见，所以 Elixir 给了一种简写， 比如:
`[ name: "Dave", city: "Dallas", likes: "Programming" ]`
Elixir 将其转变为：
`[ {:name, "Dave"}, {:city, "Dallas"}, {:likes, "Programming"} ]`

如果 keyword list 是函数调用时的最后一个参数：
`DB.save record, [ {:use_transaction, true}, {:logging, "HIGH"} ]`
Elixir 中可以简写为:
`DB.save record, use_transaction: true, logging: "HIGH"`

当然, 在任何链式类型的结构中，关键字列表的括号都是可以省略的：

```elixir
iex> [1, fred: 1, dave: 2]
[1, {:fred, 1}, {:dave, 2}] 
iex> {1, fred: 1, dave: 2}
{1, [fred: 1, dave: 2]}
```

### Maps

map 是键值对的集合。比如：
`%{ key1 => value, key2 => value}`

举一些例子：

```elixir
iex> states = %{ "AL" => "Alabama", "WI" => "Wisconsin" }
%{"AL" => "Alabama", "WI" => "Wisconsin"}
iex> responses = %{ { :error, :enoent } => :fatal, { :error, :busy } => :retry } 
%{ {:error, :busy} => :retry, {:error, :enoent} => :fatal}
iex> colors = %{ :red => 0xff0000, :green => 0x00ff00, :blue => 0x0000ff } 
%{blue: 255, green: 65280, red: 16711680}
```

如上可见，字符串、tuple 和 atoms 都可以用做 map 的 key

如果使用 atom 做 key，你可以使用 keyword list 中的简写：

```elixir
iex> colors = %{ red: 0xff0000, green: 0x00ff00, blue: 0x0000ff } %{blue: 255, green: 65280, red: 16711680}
```

你还可以使用表达式做为 key：

```elixir
iex> name = "José Valim"
"José Valim"
iex> %{ String.downcase(name) => name } %{"josé valim" => "José Valim"}
```

为什么我们同时需要 map 和 keyword list ？
map 的 key 是唯一的，而 keyword list 的 key 可以重复。 map 更高效，可以用于 模式匹配。

#### Accessing a Map

访问对象，跟 js 中访问json对象一样一样的.
一，使用方括号：

```elixir
iex> states = %{ "AL" => "Alabama", "WI" => "Wisconsin" } %{"AL" => "Alabama", "WI" => "Wisconsin"}
iex> states["AL"]
"Alabama"
iex> states["TX"] 
nil
iex> response_types = %{ { :error, :enoent } => :fatal, ...> { :error, :busy } => :retry } 
`%{ {:error, :busy} => :retry, {:error, :enoent} => :fatal}`
iex> response_types[{:error,:busy}]
:retry
```

如果 map 的key  为 atom，还可以使用 `.` 来访问：

```elixir
iex> colors = %{ red: 0xff0000, green: 0x00ff00, blue: 0x0000ff } %{blue: 255, green: 65280, red: 16711680}
iex> colors[:red]
16711680
iex> colors.green 65280
```

### Binaries

二进制的表示： `<< ... >>`

```elixir
iex> bin = << 1, 2 >>
<< 1, 2>>
iex> byte_size bin
2
```

### Dates and Times
Elixir 1.3 加入的日历模块，以及 4 种 日期时间相关的类型。
 
Calendar 模块用于操作日期，现在只有 Calendar.ISO 实现，ISO-8601表示格林乔治时间。

Date 类型，包含了 year, month, day 和 calendar 的引用。

```elixir
iex> d1 = Date.new(2016, 12, 25)
{:ok, ~D[2016-12-25]}
iex> {:ok, d1} = Date.new(2016, 12, 25)
{:ok, ~D[2016-12-25]}
iex> d2 = ~D[2016-12-25]
~D[2016-12-25]
iex> d1 == d2
true
iex> d1
~D[2016-12-25]
iex> inspect d1, structs: false
"%{__struct__: Date, calendar: Calendar.ISO, day: 25, month: 12, year: 2016}"
```

Time 类型包含 hour, minute, second, fractions of a sencond。The fraction is stored as a tuple containing microseconds and the number of significant digits.

```elixir

iex(35)> t1 = Time.new(12, 34, 56) {:ok, ~T[12:34:56]}
iex(36)> t2 = ~T[12:34:56.78] ~T[12:34:56.78]
iex(37)> t1 == t2
false
iex(38)> inspect t2, structs: false
"{:ok, %{__struct__: Time, hour: 12, microsecond: {780000, 2}, minute: 34, second: 56}}"
```

还有两种类型， DateTime 和 NaiveDateTime, Naive 版本的只是包含了一个日期和时间； DateTime 加入了 time zone 的相关属性。
第三方库 Calendar 也是很不错的。

### Names, Source Files, Conventions, Operators, and So On

Elixir 中变量命名跟其他语言类似，Module, record, protocol, and behavior 的命名需要用大写字母开头。其他的则是小写字母或者下划线开头。

### Truth
三种： true, false, nil。在 Boolean 的上下文中，nil 和 false 类似。

### Operators
Elixir 有许多 operators，下面举写例子：

```elixir
a === b   # strict  equality, 严格相等，类似 JavaScript，（ 1 === 1.0 is false )
a !== b   # strict inequality，严格不相等
a == b    # value equality ，值相等
a != b    # value inequality
a > b
a >= b
a < b
a <= b
```
如果类型相同，使用 自然顺序比较，否则使用下面的顺序：
`number < atom < reference < function < port < pid < tuple < map < list < binary`

#### Boolean operators

```elixir
a or b          # true if a is true, otherwise b
a and b         # false if a is false, otherwise b
not a           # false if a is true, true otherwise
```

#### Relaxed Boolean operators

```elixir
a || b   # a if a is truthy, otherwise b
a && b   # b if a is truthy, otherwise b
!a       # false if a is truthy, otherwise true
```

#### Arithmetic operators

`+ - * / div rem`

整数除法得到 浮点数 类型的结果，使用 div(a, b) 得到整型的结果
rem 是取余数操作，`rem(11, 3) => 2`

#### Join operators

```elixir
binary1 <> binary2     #binaries 合并
list1 ++ list2         # concatenates two lists
list1 -- list2         # removes elements of list2 from a copy of list 1
```

#### The in opeator

` a in enum`
tests if a is included in enum (for example, a list, a range, a map), for maps, a should be a {key, value} tuple


### Variable Scope
Elixir 是基于词法作用域的。最基本的是以函数为单元，函数内定义的变量是属于这个函数局部的。另外 module 内的变量
只属于 module 这一层，module 内的函数无法访问。

#### The with Expression

with 表达式有两个作用，第一，为多个变量提供一个局部的作用域。第二，给你模式匹配失败后提供控制。

比如：

```elixir
# basic-types/with-scope.exs

content = "Now is the time"
lp = with {:ok, file} = File.open("/etc/passwd"), 
  content = IO.read(file, :all),
  :ok = File.close(file),
  [_, uid, gid] = Regex.run(~r/_lp:.*?:(\d+):(\d+)/, content) 
do
  "Group: #{gid}, User: #{uid}" 
 end
IO.puts lp #=> Group: 26, User: 26 
IO.puts content #=> Now is the time
```

with 表达式让我们能高效的使用临时变量，正如上面的打开文件，读取文件，关闭文件，查找需要的行等。
with 的值为 do 表达式的值

#### with and Pattern Matching

在上面的例子中，with 表达式使用 `=` 来做模式匹配。如果匹配失败，会抛出一个 `MatchError` 异常。
当然我们可以使用更优雅的方式来处理，这就是 `<-` 操作。当你使用 `<-` 替代 `=`，匹配失败时，他会返回匹配失败的值。

```elixir
iex> with [ a | _ ] <- [1, 2, 3], do: a
1
iex> with [ a | _ ] <- nil, do: a
nil
```

我们可以让 with 语句返回 nil，当匹配失败时：

```elixir
# basic-types/with-match.exs
result = with {:ok, file} = File.open("/etc/passwd"),
  content = IO.read(file, :all),
  :ok = File.close(file),
  [_, uid, gid] <- Regex.run(~r/xxx:.*?:(\d+):(\d+)/, content)
do
  "Group: #{gid}, User: #{uid}"
end
IO.puts inspect(result) #=> nil
```

#### A minor Gotcha
Elixir 把 with 当做调用函数或者 macro。所以你不能这么做：

```elixir
mean = with
  count = Enum.count(values),
  sum = Enum.sum(values)
do
  sum/count
end
```

你应该将第一个参数放到 with 那一行:

```elixir
mean = with count = Enum.count(values),
  sum = Enum.sum(values)
do
  sum/count
end
```

或者使用括号：

```elixir
mean = with(
  count = Enum.count(values),
  sum   = Enum.sum(values)
do
  sum/count
end)

和 do 的其他用法一样，你也可以使用其简写：

```elixir
mean = with count = Enum.count(values),
        sum = Enum.sum(values),
       do: sum/count
```

### 完


