---
title: "elixir control flow"
date: 2018-01-17 22:56:26 +0800 
categories: elixir
tag: elixir
---

## Control Flow

在函数式编程中，尽量使用 声明式，而不是指令式。

所以应该尽量少用 控制流。

### if and unless

```elixir
iex> if 1 == 1, do: "true part", else: "false part
"true part"

iex> unless 1 == 1, do: "error", else: "OK"
"OK"
```

### cond

cond 是一种宏，让你列出一堆条件以及相连的处理代码。

在 FizzBuzz 游戏中，从 1 开始数，如果被 3 整除，则说 Fizz，如果被 5 整除则说 Buzz，如果同时被 3 和 5 整除，则说 BizzBuzz，否则就说出这个数。

```elixir
#control/fizzbuzz.ex

defmodule FizzBuzz do
  def upto(n) when n > 0, do: _upto(1, n, [])

  defp _upto(_current, 0, result), do: Enum.reverse result

  defp _upto(current, left, result) do
    next_answer = 
      cond do
        rem(current, 3) == 0 and rem(current, 5) == 0 ->
          "FizzBuzz"
        rem(current, 3) == 0 ->
          "Fizz"
        rem(current, 5) == 0 -> 
          "Buzz"
        true -> 
          current
      end
    _upto(current + 1, left - 1, [ next_answer | result ])
  end
end
```

检验一下：

```elixir
iex> c("fizzbuzz.ex")
iex> FizzBuzz.upto(20)
[1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz", 16, 17, "Fizz", 19, "Buzz"]
```

优化一下，去掉 reverse 函数：

```elixir
#control/fizzbuzz1.ex

defmodule FizzBuzz do

  def upto(n) when n > 0, do: _downto(n, [])

  defp _downto(0, result), do: result
  defp _downto(current, result) do
    next_answer = 
      cond do
        rem(current, 3) == 0 and rem(current, 5) == 0 ->
          "FizzBuzz"
        rem(current, 3) == 0 -> 
          "Fizz"
        rem(current, 5) == 0 ->
          "Buzz"
        true -> 
          current
      end
    _downto(current-1, [next_answer | result ])
  end
end
```

还是不够 elixir，

```elixir
# control/fizzbuzz2.ex

defmodule FizzBuzz do
  def upto(n) when n > 0 do
    1..n |> Enum.map(&fizzbuzz/1)
  end

  defp fizzbuzz(n) do
    cond do
      rem(n, 3) ==  0 and rem(n, 5) == 0 ->
        "FizzBuzz"
      rem(n, 3) == 0 -> 
        "Fizz"
      rem(n, 5) == 0 ->
        "Buzz"
      true -> 
        n
    end
  end
end
```

以上只是为了说明 cond 的用法，如果不用 cond，代码可以更 elixir：

```elixir
# control/fizzbuzz3.ex

defmodule FizzBuzz do
  def upto(n) when n > 0, do: 1..n |> Enum.map(&fizzbuzz/1)

  defp fizzbuzz(n), do: _fizzword(n, rem(n, 3), rem(n, 5))

  defp _fizzword(_n, 0, 0), do: "FizzBuzz"
  defp _fizzword(_n, 0, _), do: "Fizz"
  defp _fizzword(-n, _, 0), do: "buzz"
  defp _fizzword(n, _, _), do: n
```


### Case 

case 道理跟其他语言类似，看语法吧：

```elixir
case File.open("case.ex") do
  { :ok, file } -> 
    IO.puts "First line: #{IO.read(file, :line)}"
  { :error, reason } ->
   IO.puts "Failed to open file: #{reason}"
end
```

嵌套匹配：

```elixir
#control/case1.exs

defmodule Users do
  dave = %{name: "Dave", state: "TX", likes: "programming" }

  case dave do
    %{state: some_state} = person -> 
      IO.puts "#{person.name} lives in #{some_state}"
    _ ->
      IO.puts "No matches"
  end
end
```

还可以加入保护语句:

```elixir
control/case2.exs

dave = %{name: "Dave", age: 27}

case dave do
  person = %{age: age} when is_number(age) and age >= 21 ->
    IO.puts "You are cleared to enter the Foo Bar, #{person.name}"
  _ -> 
    IO.puts "Sorry, no admission"
end
```

### Raising Exception

首先，来自官方的提醒：异常在 Elixir 中并非控制流结构，只用于不在正常操作中出现的那些异常情况。比如数据库挂了，或者服务器无响应这类异常。
打开一个固定的文件失败可以是异常，但是如果文件名是用户输入的则不是异常。

使用 raise 函数来抛出异常。最简单的，给它传个字符串，他会生成一个 RuntimeError 类型的异常。

`iex> raise "Giving up"`
`** (RuntimeError) Giving up`

也可以指定异常的类型：

```elixir
iex> raise RuntimeError
** (RuntimeError) runtime error
iex> raise RuntimeError, message: "override message" 
** (RuntimeError) override message
```

总之，尽量少用！

### Designing with Exceptions

如果打开文件成功，会返回 `{:ok, file}`, file 为访问的文件。如果失败，则返回 `{:error, reason}`。
所以打开文件可以这么写：

```elixir
case File.open(user_file_name) do 
  {:ok, file} ->
    process(file) 
  {:error, message} ->
    IO.puts :stderr, "Couldn't open #{user_file_name}: #{message}" 
end
```

如果你期望文件总是能成功打开，你可以在失败时抛出异常：

```elixir
case File.open("config_file") do 
  {:ok, file} ->
    process(file) 
  {:error, message} ->
    raise "Failed to open config file: #{message}" 
end
```

或者你可以让 Elixir 抛出异常
`{:ok, file } = File.open("config_file")`

如果一开始的模式匹配失败，Elixir 会抛出 MatchError 的异常。这个异常的信息并不精确，但是也够用。

如果你想抛出文件的异常，你可以：
`file = File.open!("config_file")`

Elixir 中的约定，在函数后面加上 `!`，当函数调用发生错误时就会抛出异常。

