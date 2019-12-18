---
title: hackerrank solution sock merchant
date: 2018-12-25 12:05:11
tags:
---


# Hackerrank 题目 Sock Merchant
题目地址
题目 是 找出 一个数组中 相同的 元素，两个相同的元素 结成 一对，计算一共有多少对。

输入 n， 比如 10输入 一个数组， 
比如 10 20 20 10 10 30 50 10 20

输出 3
很简单，直接上代码：

```elixir
defmodule Solution do
  def main() do
    _ = IO.gets("") |> String.trim() |> String.to_integer()
    num = IO.gets("") 
    |> String.trim() 
    |> String.split()
    |> Enum.group_by( &(&1) )
    |> Enum.reduce(0, fn {_, arr}, acc -> div(length(arr), 2) + acc end )    
    IO.puts num  
  end
end
```

Solution.main()分组，然后累加每组长度除以2的值主要是 group_by 和 reduce 的用法


