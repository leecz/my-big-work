---
title: "elixir strings and binaries"
date: 2018-01-16 22:56:26 +0800 
tags: ["elixir"]
---

## Strings and Binaries

### string Literals

Elixir 中有两种 string：单引号的和双引号的，他们内部的表示结构完全不同，但是他们有很多共通的东西。

- 都能包含 UTF-8 编码的字符
- 都能使用转义字符： `\a BEL (0x07) \e ESC (0x1b) \r CR (0x0d) \v VT (0x0b) \b BS (0x08) \f FF (0x0c) \s SP (0x20) \uhhh 1–6 hex digits \d DEL (0x7f) \n NL (0x0a) \t TAB (0x09) \xhh 2 hex digits`
- 都可以插值`#{...}`
- 都可以使用 `\` 来逃脱转义
- 都支持 heredocs

#### Heredocs

多行文本。
使用 `IO.write` 输出多行文本，使用 `IO.puts` 输出单行，因为 puts 会在输出后面加换行符。

heredocs 的语法 `''' 或者 """`

#### Sigils

魔法标记，类比 ruby。
我们已经使用过 `~r{...}` 表示正则表达式，
魔法标记的语法，以 `~` 开始，然后是大小写都可以的字母，然后是边界符号，可以是 `<...>, {...}, [...], (...), |...|, /.../, "...", '...'等。

决定魔法标记的字母有如下这些：

- ~C 没有转义和插值的字符列表
- ~c 有转义和插值的跟单引号字符串类似 
- ~D Date，格式化为`yyyy-mm-dd`
- ~N 简单的 DateTime，格式化为`yyyy-mm-dd hh:mm:ss[.ddd]
- ~R 没有转义和插值的正则表达式
- ~r 有转义和插值的正则表达式
- ~S 没有转义和插值的字符串
- ~s 有转义和插值的字符串
- ~T Time, 格式化为 `hh:mm:ss[.dddd]`
- ~W 没有转义和插值的单词列表
- ~w 有转义和插值的单词列表

看看例子就知道了：

```elixir
iex> ~C[1\n2#{1+2}] 
'1\\n2\#{1+2}'
iex> ~c"1\n2#{1+2}" 
'1\n23'
iex> ~S[1\n2#{1+2}] 
"1\\n2\#{1+2}"
iex> ~s/1\n2#{1+2}/ 
"1\n23"
iex> ~W[the c#{'a'}t sat on the mat]
["the", "c\#{'a'}t", "sat", "on", "the", "mat"]
iex> ~w[the c#{'a'}t sat on the mat]
["the", "cat", "sat", "on", "the", "mat"]
iex> ~D<1999-12-31>
~D[1999-12-31]
iex> ~T[12:34:56]
~T[12:34:56]
iex> ~N{1999-12-31 23:59:59}
~N[1999-12-31 23:59:59]
```

`~W 和 ~w` 还可以带选项，`a, c, s`表示元素的类型为 `atoms, list, 还是 string`

```elixir
iex> ~w[the c#{'a'}t sat on the mat]a 
[:the, :cat, :sat, :on, :the, :mat] 
iex> ~w[the c#{'a'}t sat on the mat]c
['the', 'cat', 'sat', 'on', 'the', 'mat']
iex> ~w[the c#{'a'}t sat on the mat]s 
["the", "cat", "sat", "on", "the", "mat"]
```

如果边界符号为 `'''` 或者 `"""`，等同 heredoc 对待，结果跟字符串的一样。


### The Name "strings"

在 Elixir 中，我们一般叫双引号的为 strings（字符串），单引号的为字符列表。


### Single-Quoted Strings -- Lists of Character Codes

单引号的字符串其实是一串整数值，每个值表示 ASCII 码中对应的字符，鉴于此，我们通常称其为字符列表（character lists）。

```elixir
iex> str = 'wombat'
'wombat'
iex> is_list str
true
iex> length str
6
iex> Enum.reverse str
'tabmow'
```

这里容易产生困惑，iex 中输出的是字符串，这是因为 iex 中打印整数的 list 就会将其转为字符后输出。
比如 `iex> [67, 65, 84]` 输出 'CAT'

当然，你也可以直接看它的数字表示：

```elixir
iex> str = 'wombat'
'wombat'
iex> :io.format "~w~n", [ str ] 
[119,111,109,98,97,116]
:ok
iex> List.to_tuple str
{119, 111, 109, 98, 97, 116} 
iex> str ++ [0]
[119, 111, 109, 98, 97, 116, 0]
```

`~w` 符号让 string 以 Elixir 的方式格式化，`~n`表示新行。
最后面那个例子创建了一个新的字符列表，列表最后是一个 null 字节。iex 知道有字节不可打印，所以返回了整数列表形式。

同理 `'∂x/∂y' #=> [8706, 120, 47, 121]` 

因为字符列表也是列表，所以也可以使用模式匹配以及 List 函数。

```elixir
iex> 'pole' ++ 'vault' 
'polevault'
iex> 'pole' -- 'vault' 
'poe'
iex> List.zip [ 'abc', '123' ] 
[{97, 49}, {98, 50}, {99, 51}] 
iex> [ head | tail ] = 'cat' 'cat'
iex> head 
99
iex> tail 
'at'
iex> [ head | tail ] 
'cat'
```

事实上，符号 `?c` 会返回字符 c 的整数表示。来看个例子：

```elixir
# strings/ parse.exs

defmodule Parse do
  def number([ ?- | tail ]), do: _number_digits(tail, 0) * -1
  def number([ ?+ | tail ]), do: _number_digits(tail, 0)
  def number(str), do: _number_digits(str, 0)
  defp _number_digits([], value), do: value
  defp _number_digits([ digit | tail], value)
  when digit in '0123456789' do
    _number_digits(tail, value * 10 + digit - ?0)
  end
  defp _number_digits([ non_digit | _], _) do
    raise "Invalid digit '#{[non_digit]}'"
  end
end
```

测试：

```elixir
iex> c("parse.exs")
iex> Parse.number('123')
123
iex> Parse.number('-123')
-123
iex> Parse.number('+123')
123
iex> Parse.number('+9')
9
iex> Parse.number('+a')
**  (RuntimeError) Invalid digit 'a'
```

### Binaries

二进制类型字面表示为： `<< term, ...>>`

```elixir
iex> b = << 1, 2, 3 >> 
<<1, 2, 3>>
iex> byte_size b
3
iex> bit_size b 
24
```

你可以指定二进制项的大小（bits）。

```elixir
iex> b = << 1::size(2), 1::size(3) >> # 01 001
<<9::size(5)>> # = 9 (base 10)
iex> byte_size b
1
iex> bit_size b
5
```

在 binaries 中，你可以使用 integer， floats 还有其他 binaries 

```elixir
iex> int = << 1 >>
<<1>>
iex> float = << 2.5 :: float >>
<<64, 4, 0, 0, 0, 0, 0, 0>>
iex> mix = << int :: binary, float :: binary >> 
<<1, 64, 4, 0, 0, 0, 0, 0, 0>>
```


### Double Quoted Strings Are Binaries

双引号字符串是以UTF-8 编码的连续的字节中的，这样在内存中的效率会更高，所以有两点要注意。

一, 因为 UTF-8 字符不止一个字节来表示，二进制的长度不一定是string 的长度。

```elixir
iex> dqs = "∂x/∂y"
iex> String.length dqs
5
iex> byte_size dqs
9
iex> String.at(dqs, 0)
"∂"
iex>  String.codepoints(dqs)
["∂", "x", "/", "∂", "y"]
iex> String.split(dqs, "/") 
["∂x", "∂y"]
```

二，因为不是使用 list 了，你需要使用 binary 的语法。

#### Strings and Elixir Libraries

在 Elixir 文档中使用的单词 string 一般指 双引号的 string。

`String` 模块定义了操作 string 的函数。

`at(str, offset)` 返回指定下标的字符

`capitalize(str)` 首字符大写，其他小写

`codepoints(str)` 返回 str 的 字符列表。

`downcase(str)` 返回 str 的小写形式

`duplicate(str, n)` 返回 复制了 n 遍 str 的字符串

`ends_with?(str, suffix | [suffixes])` 如果以某些个后缀结尾则返回 true

`first(str)` 返回第一个字符

`graphemes(str)` 以最小有意义的单元分割字符串，返回列表。

`jaro_distance` 返回 两字符串的相似程度，值在 0 - 1 之间。

`last(str)` 返回最后的字符

`length(str)` 返回字符串长度

`myers_difference` 返回从一个字符串转变到另一个字符串的所有操作。

`next_codepoint(str)` 返回 `{codepoint, rest}` codepoint 为 str 的首字符。

`next_grapheme(str)` 同 `next_codepoint`。

`pad_leading(str, new_length, padding \\ 32)` 字符填充，填充在左边。

`pad_trailing(str, new_length, padding \\ " ")` 字符填充，填充在右边。

`printable?(str)` 如果所有字符都是可以打印的，返回 true。

`replace(str, pattern, replacement, options \\ [global: true, insert_replaced: nil])` 字符替换。

```elixir
iex> String.replace "the cat on the mat", "at", "AT"
"the cAT on the mAT"
iex> String.replace "the cat on the mat", "at", "AT", global: false
"the cAT on the mat"
iex> String.replace "the cat on the mat", "at", "AT", insert_replaced: 0 
"the catAT on the matAT"
iex> String.replace "the cat on the mat", "at", "AT", insert_replaced: [0,2] 
"the catATat on the matATat"
```

`reverse(str)` 反转字符

`slice(str, offset, len)` 字符串截取

`split(str, pattern \\ nil, options \\ [global: true])` 字符串分割

`starts_with?(str, prefix | [ prefixes ])` 以某些个字符串开头则返回 true

`trim(str)` 去掉首尾的空串

`trim(str, character)` 去掉首尾的某个字符

`trim_leading(str)` 去掉首部的空串


`trim_leading(str, character)` 去掉首部的字符

`trim_trailing(str)` 去掉尾部的空串

`trim_trailing(str, character)` 去掉尾部的字符

`upcase(str)` 转大写

`valid?(str)` str 只有一个合法的字符 则返回 true


### Binaries and Pattern Matching

首先要记住 "如果你怀疑，指定类型先"，可用的类型有 binary, bits, bitstring, bytes, float, integer, utf8, utf16, utf32 等。而且你可以加上修饰符。

- size(n): bits 的大小。
- signed 或者 unsigned，对于 integer 字段，是否有符号。
- 其他： big, little, native

`<< length::unsigned-integer-size(12), flags::bitstring-size(4) >>  = data`

#### String Processing with Binaries

同 list 一样，同样可以匹配 首尾。

```elixir
# strings/utf-iterate.ex
defmodule Utf8 do
  def each(str, func) when is_binary(str), do: _each(str, func)
  defp _each(<< head :: utf8, tail :: binary >>, func) do
    func.(head)
    _each(tail, func)
  end

  defp _each(<<>>, _func), do: []
end

Utf8.each "∂og", fn char -> IO.puts char end

# => 
8706
111
103
```






