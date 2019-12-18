---
title: hackerrank solution mark and toys
date: 2018-12-25 12:22:12
tags:
---


# Hackerrank 题目 Mark and Toys

[题目地址](https://www.hackerrank.com/challenges/mark-and-toys/problem?h_l=interview&playlist_slugs%5B%5D=interview-preparation-kit&playlist_slugs%5B%5D=sorting)

题目很简单，排序，累加元素的和，在给定的数额内，计算尽可能多的元素个数。

代码如下：

```elixir
defmodule Solution do
  def main do
    [_, k] = IO.gets("") |> String.trim() |> String.split() |> Enum.map( &(String.to_integer/1) )
​
    arr = IO.gets("") |> String.trim() |> String.split() |> Enum.map( &(String.to_integer/1) )
​
    sorted_arr = arr |> Enum.sort()
​
    comp(sorted_arr, [], 0, k)
  end
​
  def comp( _ , new_arr, sum, k) when sum > k, do: IO.puts(length(new_arr) - 1)
  def comp([head | tail], new_arr, sum, k) when sum <= k do
    comp(tail, [ head | new_arr] ,  sum + head, k)
  end
end
​
Solution.main()
```


关键点：数组加入新元素时，[head | new_arr] 比 new_arr ++ [head] 要高效（网上看到的）

然后输入的参数都是字符串，在做运算和计较之前，请先转换类型。

