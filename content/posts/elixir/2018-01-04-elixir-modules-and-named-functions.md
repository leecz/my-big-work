---
title: "elixir modules and named functions"
date: 2018-01-04 22:56:26 +0800 
tag: elixir
---


## Modules and Named Functions

Elixir 中的具名函数必须写在模块中。

来看一个简单例子，创建一个 `times.exs` 的文件

```elixir
# mm/times.exs

defmodule Times do
  def double(n) do
    n * 2
  end
end
```

这里我们定义了一个名叫 Times 的模块。它包含一个函数 double。

### Compiling a Module

有两种方式来编译这个文件和载入 iex。一，如果你使用命令行，你可以这么做：

```elixir
$ iex times.exs
itx> Times.double(4)
8
```

iex 加文件名，这样就可以编译并载入文件。

二，如果你已经在 iex 中，你可以使用`c`帮助函数来编译文件。

```elixir
iex> c "times.exs"
[Times]
iex> Times.double(4)
8
iex> Times.double(123)
246
```

如上可以。

在 Elixir 中，一个命名函数的标识包含其名字和参数个数，就算函数名字相同但参数不同，这也是两个完全不相干的两个函数。

### The Function's Body Is a Block

`do...end` 块是将一些表达式组织起来传递给其他代码的方式。被用于 模块 和 具名函数 的定义、控制结构体等等很多地方。
不过 `do...end` 只是一种语法糖，真正的语法是：`do: ()`
比如：

```elixir
def double(n), do: n * 2

# 多行加括号
def greet(greeting, name), do: (
  IO.puts gretting
  IO.puts "How're you doing, #{name}?"
)
```

其实 `do: xxx` 也只是一种简化的关键字列表。通常在一行内使用 `do: xxx` 多行的话使用 `do...end`

所以之前的例子可以改为：

```elixir
#mm/times1.exs
defmodule Times do
  def double(n), do: n * 2
end

# 甚至是

defmodule Times, do: (def double(n), do: n * 2) 
# but please don't, hahaha
```

### Function Calls and Pattern Matching

函数参数的模式匹配跟之前的匿名函数一样一样的。区别是要根据参数不同定义一个又一个函。Elixir 会逐个去匹配，不过参数个数一定要相同。

我们来定义一个 `n!` 的函数，计算 n 的阶乘。

```elixir
#mm/factorial1.exs
defmodule Factorial do
  def of(0), do: 1
  def of(n), do: n * of(n - 1)
end
```

注意了，Elixir 是从上到下匹配的，所以函数定义的顺序是会影响运行结果的。

### Guard Clauses

如果我们需要区分参数的类型或者筛选一类值时，怎么办？这时，你需要使用 guard clauses。在定义函数时，使用 when 关键字来加入一些判断，在进行模式匹配时，先进行值匹配，然后再计算 when 关键字中的判断，判断为真时再执行函数体。

```elixir
defmodule Guard do
  def what_is(x) when is_number(x) do
    IO.puts "#{x} is a number"
  end
  def what_is(x) when is_list(x) do
    IO.puts "#{inspect(x)} is a list"
  end
  def what_is(x) when is_atom(x) do
    IO.puts "#{x} is an atom"
  end
end

Guard.what_is(99) # => 99 is a number
Guard.what_is(:cat) # => cat is an atom
Guard.what_is([1, 2, 3])  # => [1, 2, 3] is a list
```

来看看之前的例子：

```elixir
defmodule Factorial do
  def of(0), do: 1
  def of(n), do: n * of(n-1)
end
```
当传入一个负数的参数时，函数将无限循环，这时可以加入一个 guard clause 来阻止这种情况发生。

```elixir
defmodule Factorial do 
  def of(0), do: 1
  def of(n) when n > 0 do
    n * of(n-1)
  end
end
```

这时传入一个负数，就会报错，找不到函数分支。

### Guard-Clause Limitations

guard-Clause 的表达式是受限的，下面有一个可以使用的列表：

- Comparison operators
    ==, !=, ===, !==, >, <, <=, >=

- Boolean and negation operators
    or, and, not, !, 注意 `|| && ` 是不允许的。

- Arithmetic operators
    +, -, *, /

- Join operators
    <> and ++

- The in operator
    collection or range 的包含关系

- Type-check functions
    内置的 Erlang 类型判断函数：`is_atom is_binary is_bitstring is_boolean is_exception is_float is_function is_integer is_list is_map is_number is_pid is_port is_record is_reference is_tuple`

- Other functions
    内置的其他一些函数，比如： `abs(number) bit_size(bitstring) byte_size(bitstring) div(number,number) elem(tuple, n) float(term) hd(list) length(list) node() node(pid|ref|port) rem(number,number) round(number) self() tl(list) trunc(number) tuple_size(tuple)`


### Default Parameters

命名函数的默认参数，语法 `param \\ value`, 参数从左到右匹配。

```elixir
# mm/default_params.exs

defmodule Example do
  def func(p1, p2 \\ 2, p3 \\ 3, p4) do
    IO.inspect [p1, p2, p3, p4]
  end
end

Example.func("a", "b")
Example.func("a", "b", "c") 
Example.func("a", "b", "c", "d")
# => ["a",2,3,"b"]
# => ["a","b",3,"c"]
# => ["a","b","c","d"]
```

特别注意，在进行模式匹配的时候，设置默认值很容易发生错误，
如果设置默认值，最好是只写函数的头，不写函数体：

```elixir
# mm/default_params2.exs
defmodule Params do
  def func(p1, p2 \\ 123)
  def func(p1, p2) when is_list(p1) do 
    "You said #{p2} with a list"
  end
  def func(p1, p2) do
    "You passed in #{p1} and #{p2}"
  end
end
```

### Private Functions

宏 `defp` 用于定义私有函数，私有函数只能在定义函数的模块中访问。
当定义多个函数头时，不能公有和私有混用。

### The Amazing Pipe Operator: |>

神奇的管道，类比 linux 的管道，很好理解。

类似这样的代码

```elixir
people = DB.find_customers
orders = Orders.for_customers(people)
tax    = sales_tax(orders, 2016)
filing = prepare_filing(tax)
```

可以写成：
`filing = prepare_filing(sales_tax(Orders.for_customers(DB.find_customers), 2016))`

他们的特点：一个函数的输入是另一个函数的输出，这样的代码很难看。

Elixir way：

```elixir
filing = DB.find_customers
           |> Orders.for_customers
           |> sales_tax(2016)
           |> prepare_filing
```

`|>` 管道操作就是将其左边表达式的结果传给其右边函数的第一个参数。

`val |> f(a, b)` => `f(val, a, b)`

写在同一行内当然也是可以的。

```elixir
iex> (1..10) |> Enum.map(&(&1*&1)) |> Enum.filter(&(&1 < 40)) 
[1, 4, 9, 16, 25, 36]
```

这种代码简单易懂，JavaScript 也还可以的。

```javascript
let arr = [1, 2, ... 10]
arr.map( el => el * el ).filter( el => el < 40)
```

### Modules

模块给你定义东西时提供一个命名空间，你可以用来封装 named functions, macros, structs, protocols, and other modules。

访问外部模块的函数需要加上模块名，访问模块内部的函数不需要。

```elixir
defmodule Outer do 
  defmodule Inner do
    def inner_func do
    end 
  end
  def outer_func do 
    Inner.inner_func
  end 
end

Outer.outer_func
Outer.Inner.inner_func
```

还是很直观的。

模块嵌套其实是一种假象，Elixir 中 所有模块都在最顶层定义，模块内定义的模块，
只是简单将外面的模块名加个点和模块名合在一起。

### Directives for Modules

Elixir 有三个跟模块相关的指令。

#### import

import 指令将一个模块的函数或者宏导入当前作用域。这样可以避免重复的输入模块名。

```elixir
# mm/import.exs

defmodule Example do
  def func1 do
    List.flatten [1, [2, 3], 4]
  end

  def func2 do
    import List, only: [flatten: 1]
    flatten [5, [6, 7], 8]
  end
end
```

import 的语法 `import Module [, only: | except :]`

第二个可选的参数让你精确控制导入的函数或者宏。`only: or except:` 后面跟着 `name: arity`对组成的 list。

`import List, only: [ flatten: 1, duplicate: 2 ]`

或者 `only: :functions or only: :macros` 

#### alias

为模块起个别名，可以减少重复输入的痛苦。

```elixir
defmodule Example do
  def compile_and_go(source) do
    alias My.Other.Module.Parser, as: Parser
    alias My.Other.Module.Runner, as: Runner
    source
    |> Parser.parse()
    |> Runner.execute()
  end
end
```

还可以简写
`alias My.Other.Module.Parser`
`alias My.Other.Module.Runner`

as 默认为模块的最后一节。
还可以简写
`alias My.Other.Module.{Parser, Runner}`

#### require
macros 使用相关，后面再讲。

### Module Attributes

Elixir 的模块拥有元数据，每个元数据的项称为模块的属性。在模块内，可以使用 `@` 符号加属性名来访问属性。
语法： `@name value`，你只能在 module 这一层设置属性，不能再函数内设置哦，不过可以在函数内访问。

```elixir
# mm/attributes.exs
defmodule Example do 
  @author "Dave Thomas" 
  def get_author do
    @author
  end 
end
IO.puts "Example was written by #{Example.get_author}"
```

在 module 内，你可以给属性多次设置值，不过在具名函数内的属性值为函数定义时看到的属性值，看例子吧：

```elixir
# mm/attributes1.exs
defmodule Example do 
  @attr "one"
  def first, do: @attr 
  @attr "two"
  def second, do: @attr 
end
IO.puts "#{Example.second} #{Example.first}"
# => two one
```
记住，这些属性不是传统的变量，把他们用于配置或者元数据。

### Module Names: Elixir, Erlang, and Atoms

在 Elixir 中编写模块时，他们拥有名字，比如 String 或者 PhotoAlbum。
我们可以调用其中的方法，比如`String.length("abc")`

这里面是很微妙的。在内部，模块的名字就是 atoms。当你以大写字母开头命名时，比如 IO，Elixir
将他们转化为 atom，比如 `Elixir.IO`。

```elixir
iex> is_atom IO
true
iex> to_string IO
"Elixir.IO"
iex> :"Elixir.IO" === IO
true
```

所以，调用模块内的函数，就是一个 atom 加一个 `.` 在加函数名。比如：

```elixir
iex> IO.puts 123
123
iex> :"Elixir.IO".puts 123
123
```

### Calling a Function in an Erlang Library

Erlang 的命名约定则不同，变量以大写字母开头，atom 是简单的小写。比如 Erlang 的 timer 模块 就是 atom timer。在 Elixir 中，我们写为 :timer。如果你想调用 timer 的 tc 函数，你得这样写 
`:timer.tc`。
假设我们想使用 Erlang 中的函数格式化打印一个占一位小数的浮点数:

```elixir
iex> :io.format("the number is ~3.1f~n", [5.678])
the number is 5.7
:ok
```

### Finding Libraries
如果你想使用某个库，你得先在 Elixir 中的模块找，网上有文档哈。
如果没有找到，你再再 Erlang 的库中找找，文档网上有哈。
注意 Elixir 和 Erlang 的命名区别就是了。