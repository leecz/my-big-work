---
title: hackerrank solution jumping on the clouds
date: 2018-12-25 12:12:02
tags:
---

# Hackerrank 题目 Jumping on the Clouds

[题目地址](https://www.hackerrank.com/challenges/jumping-on-the-clouds/problem?h_l=interview&playlist_slugs%5B%5D=interview-preparation-kit&playlist_slugs%5B%5D=warmup)

题目是 一个数组由 0 和 1 构成，比如 [0, 0, 0, 0, 1, 0] , 从数组头部（ index 为 0） 跳到数组尾部，一次可以跳 1或者 2 格，但是不能跳到值为1的元素上，求最少步数，上面最少步数的路径为 0 -> 2 -> 3 -> 5 , 需要 3 步，输出 3 即可。

代码也很简单：

```elixir
defmodule Solution do  
  def main do    
    _ = IO.gets("")    
    arr = IO.gets("")      
    |> String.trim()      
    |> String.split()      
    |> Enum.map(&(String.to_integer/1))
    jump(arr, 0) |> IO.puts  
  end

  defp jump([0], count), do: count  
  defp jump([ _ , _ , three | tail], count) when three == 0, do: jump([three | tail], count + 1)  
  defp jump([ _ | tail], count), do: jump(tail, count + 1)
end

Solution.main()
```

关键点： elixir 的递归遍历数组， 函数参数模式匹配