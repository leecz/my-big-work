---
title: "elixir functions"
date: 2017-12-25 22:56:26 +0800 
categories: elixir
tag: elixir
---


## Anonymous Functions

Elixir 是 一门函数式语言，理所当然函数是一种基本的类型。

匿名函数由 fn 关键字创建。

```elixir
fn
  parameter-list -> body
  parameter-list -> body
end
```

可以把 `fn...end` 当做字符串两端的引号，只是我们返回的是一个函数而非字符串。我们可以把函数当做值来传递，可以调用他，作为参数传递。
最简单的，一个函数有参数列表和函数体，由 `->` 分开
举个例子，下面定义了一个函数，并将其绑定给 sum 变量，然后调用它：

```elixir
iex> sum = fn (a, b) -> a + b end
#Function<...>
iex> sum.(1, 2)
3
```

在上面，`sum.(1,2)` 为函数调用，匿名函数需要使用 `.` 来调用，而具名函数则不需要。
即使函数不需要参数，也要使用括号来调用：

```elixir
iex> greet = fn -> IO.puts "Hello" end 
#Function<12.17052888 in :erl_eval.expr/5>
iex> greet.()
Hello
:ok
```

不过，你可以在定义函数时省略括号：

```elixir
iex> f1 = fn a, b -> a * b end 
#Function<12.17052888 in :erl_eval.expr/5>
iex> f1.(5,6)
30
iex> f2 = fn -> 99 end 
#Function<12.17052888 in :erl_eval.expr/5> 
iex> f2.()
99
```

### Functions and Pattern Matching

当我们调用 `sum.(2,3)` 时，很容易认为是把 2 赋值给 a，3 赋值给 b。 但其实不是。Elixir 没有
赋值。Elixir 总会试图去进行模式匹配。

譬如 `a = 2`, Elixir 将 2 绑定到 a 来进行模式匹配，函数调用时，参数就是在进行模式匹配。
模式匹配还可以这样：`{a, b} = {1, 2}`
比如：

```elixir
iex> swap = fn {a, b} -> {b, a} end
#Function<...>
iex> swap.({6, 8})
{8, 6}
```

### One Function, Multiple Bodies

一个函数定义可以有不同的实现，取决于参数的类型和内容，但参数的数量必须一样。
Elixir 会进行模式匹配来决定执行哪一个分支。举个例子：

```elixir
iex> handle_open = fn
   >  {:ok, file} -> "Read data: #{IO.read(file, :line)}"
   >  {_, error} -> "Error: #{:file.format_error(error)}"
   > end
#Function<...>
iex> handle_open.(file.open("code/helo.exs"))
"Read data: IO.puts xxxxxx"
iex> handle_open.(File.open("nonexistent"))
"Error: no such file or directory"
```

当打开文件成功，则执行匹配成功的分支，如果失败则执行匹配失败的分支。
这个例子中我们还接触了 `File` 模块，以及字符串插值 `#{...}`，用过 ruby 和 es6 的都知道吧。

##### 到文件中去
代码越来越多，命令行已经不好用了，让我们写到文件中去
`first_steps/handle_open.exs`

```elixir
handle_open = fn
{:ok, file} -> "First line: #{IO.read(file, :line)}" {_, error} -> "Error: #{:file.format_error(error)}"
end
IO.puts handle_open.(File.open("Rakefile")) # call with a file that exists IO.puts handle_open.(File.open("nonexistent")) # and then with one that doesn't
```

在 iex 中，输入：
`c "handle_open.exs"`

或者直接在命令行中输入：
`elixir handle_open.exs`

想直接执行的脚本使用 exs 为后缀，想编译后执行的使用 ex 为后缀。


### Functions Can Return Functions

来看看这些代码：

```elixir
iex> fun1 = fn -> fn -> "Hello" end end
#Function<12.17052888 in :erl_eval.expr/5> 
iex> fun1.()
#Function<12.17052888 in :erl_eval.expr/5> 
iex> fun1.().()
"Hello"
```

把第一行展开来看看：

```elixir
func1 = fn -> 
           fn -> 
             "Hello"
           end
        end
```

其实就是函数返回函数，类似于 es6 的胖箭头函数。

我们常常将里面的函数加上括号，看上去更清晰直观。

```elixir
iex> fun1 = fn -> (fn -> "Hello" end) end
#Function<...>
iex> other = fun1.()
#Function<...>
iex> other.()
"Hello"
```

### Functions Remember Their Original Environment

来将嵌套函数更加深入一点：

```elixir
iex> greeter = fn name -> (fn -> "Hello #{name}" end) end 
#Function<12.17052888 in :erl_eval.expr/5>
iex> dave_greeter = greeter.("Dave") 
#Function<12.17052888 in :erl_eval.expr/5>
iex> dave_greeter.() 
"Hello Dave"
```

类比 js 的闭包吧，就是内层函数加上其作用域上绑定的变量等

#### Parameterized Functions
来看看另一个例子：

```elixir
iex> add_n = fn n -> (fn other -> n + other end) end 
#Function<12.17052888 in :erl_eval.expr/5>
iex> add_two = add_n.(2)
#Function<12.17052888 in :erl_eval.expr/5>
iex> add_five = add_n.(5) 
#Function<12.17052888 in :erl_eval.expr/5> 
iex> add_two.(3)
5
iex> add_five.(7)
12
```

依然可以类比 js

### Passing Functions As Arguments
函数也是值，所以也可以把函数当做参数传递。

```elixir
iex> times_2 = fn n -> n * 2 end 
#Function<12.17052888 in :erl_eval.expr/5>
iex> apply = fn (fun, value) -> fun.(value) end 
#Function<12.17052888 in :erl_eval.expr/5>
iex> apply.(times_2, 6)
12
```

在 Elixir 的代码中，这种传递函数的代码随处可见。比如，内置的 Enum 模块的 map 方法，它
接收 两个参数，一个 collection 和一个函数，然后返回一个 list。

```elixir
iex> list = [1, 3, 5, 7, 9]
[1, 3, 5, 7, 9]
iex> Enum.map list, fn elem -> elem * 2 end 
[2, 6, 10, 14, 18]
iex> Enum.map list, fn elem -> elem * elem end 
[1, 9, 25, 49, 81]
iex> Enum.map list, fn elem -> elem > 6 end 
[false, false, false, true, true]
```

#### Pinned Values and Function Parameters

pin 操作对于函数参数的模式匹配同样适用

```elixir
# functions/pin.exs
defmodule Greeter do
  def for(name, greeting) do
    fn
      (^name) -> "#{greeting} #{name}"
      (_) -> "I don't know you" end
    end 
  end
mr_valim = Greeter.for("José", "Oi!") 

IO.puts mr_valim.("José") # => Oi! José
IO.puts mr_valim.("dave") # => I don't know you
```

#### The & Notation

匿名函数的简写。

```elixir
iex> add_one = &(&1 + 1) # same as add_one = fn (n) -> n + 1 end 
#Function<6.17052888 in :erl_eval.expr/5>
iex> add_one.(44)
45
iex> square = &(&1 * &1) 
#Function<6.17052888 in :erl_eval.expr/5>
iex> square.(8)
64
iex> speak = &(IO.puts(&1)) 
&IO.puts/1
iex> speak.("Hello")
Hello
:ok
```

如上 `&` 符号将其后的表达式转为函数，占位符 `&1,&2...` 表示参数列表。所以: `&(&1 + &2) 等价于 fn p1, p2 -> p1 + p2 end`

看到 speak 那行没，Elixir 将其做了优化，直接引用 `IO.puts/1` 函数。
这种优化的前提是 参数 顺序一致。
比如：

```elixir
iex> rnd = &(Float.round(&1, &2)) 
&Float.round/2
iex> rnd = &(Float.round(&2, &1))
#Function<12.17052888 in :erl_eval.expr/5>
```

再比如：`&abs(&1)` 返回来的是这个 `&:erlang.abs/1.`
因为 Elixir 是基于 Erlang VM 的。

因为 `[]` 和 `{}` 都是操作符，字面的 list 和 tuple 也可以转为 function。下面这个例子中，定义了一个函数，返回值是两个整数的商和余数组成的 tuple。

```elixir
iex> divrem = &{ div(&1, &2), rem(&1, &2) }
#Function<...>
iex> divrem.(13, 5)
{2, 3}
```

`&` 函数的第二种形式，给定一个具名的函数及其参数个数，前面加 & 符号，即可将其转为匿名函数。
来看看这些例子：

```elixir
iex> l = &length/1
&:erlang.length/1 
iex> l.([1,3,5,7]) 
4

iex> len = &Enum.count/1 
&Enum.count/1
iex> len.([1,2,3,4])
4

iex> m = &Kernel.min/2 
&:erlang.min/2
iex> m.(99,88)
88
```

`&` 的方式 给了我们一种传递函数的绝妙方式。
看看下面的例子：

```elixir
iex> Enum.map [1, 2, 3, 4], &(&1 + 1)
[2, 3, 4, 5]
iex> Enum.map [1, 2, 3, 4], &(&1 * &1)
[1, 4, 9, 16]
iex> Enum.map [1, 2, 3, 4], &(&1 < 3)
[true, true, false, false]
```

### Functions Are the Core

在一开始，我们说过 编程的基本就是转换数据。而函数就是数据转换的小引擎。在 Elixir 中函数是核心点。

