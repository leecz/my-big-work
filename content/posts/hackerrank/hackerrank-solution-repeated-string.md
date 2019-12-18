---
title: hackerrank solution repeated string
date: 2018-12-25 12:17:11
tags:
---

# hackerrank 题目 Repeated String

​[题目地址​](https://www.hackerrank.com/challenges/repeated-string/problem?h_l=interview&playlist_slugs%5B%5D=interview-preparation-kit&playlist_slugs%5B%5D=warmup)

题目是算重复字符串中 a 的个数，比如 一个字符串比如 abc ，需要重复到 10 个字符，也就是 abcabcabca ，一共有4个a字符。

输入1 一个字符串：s， 比如 abcd，ababa, abbcdeabadakfka

输入2 重复后的长度： n， 比如 100 10000 100000

输出 a 字符的个数： x，

很简单的算术题，直接上代码：

```elixir
defmodule Solution do
  def main() do
    str_arr = IO.gets("") |> String.trim() |> String.to_charlist()
    num = IO.gets("") |> String.trim() |> String.to_integer()
​
    a_count = div(num, length(str_arr)) * Enum.count(str_arr, fn x -> x == ?a end)
​
    case rem(num, length(str_arr)) do
      0 ->
        IO.puts a_count
      n ->
        left_count = str_arr |> Enum.slice(0, n) |> Enum.count(fn x -> x == ?a end)
        IO.puts a_count + left_count
    end
  end
end
​
Solution.main()
```

关键点： 数学运算 div, rem 函数，列表切割 Enum.slice , 列表元素计数 Enum.count