---
title: hackerrank solution new year chaos
date: 2018-12-25 12:19:29
tags:
---

# Hackerrank 题目 New Year Chaos

​[题目地址​](https://www.hackerrank.com/challenges/new-year-chaos/problem?h_l=interview&playlist_slugs%5B%5D=interview-preparation-kit&playlist_slugs%5B%5D=arrays)

题目是讲一个插队的事

队伍原本是 [1, 2, 3, 4, 5 ] 当然还可以更长，但都是有顺序的。

现在要插队成：[2, 1, 5, 3, 4], 输出需要的步数。这里是 2 往前 1 步， 5往前2步，所以一共是3步，即可。

每个人最多只能往前 走 2步，走多了就输出 Too chaotic 

输入是队伍的长度 和 要插队后的队伍，输出最小步数 或者  Too chaotic   

花了3个小时，走了些弯路，对题目规则没搞清就开始写代码，浪费了很多时间，主要是处理每个人最多走 2 步这个条件的时候，一开始想用计数器来搞，后面发现很麻烦，而且没做对。用下面最终的方法，虽然笨了点，但是能解决问题。

```elixir
defmodule Solution do
  def main do
    n = IO.gets("") |> String.trim() |> String.to_integer()
    1..n |> Enum.each( fn _ -> handle_data() end )
  end
​
  def handle_data do
    max = IO.gets("") |> String.trim() |> String.to_integer()
    changed = IO.gets("") |> String.trim() |> String.split() |> Enum.map(&(String.to_integer/1))
    origin = 1..max |> Enum.to_list()
​
    compare_el(changed, origin, 0, 0)
  end
​
  def compare_el([], [], _, total), do: IO.puts(total)
  def compare_el([head_c | tail_c] = changed, [head_o | tail_o] = origin, current_index, total) do
    case head_c == head_o do
      true ->
        compare_el(tail_c, tail_o, current_index, total)
      false ->
        find_index = Enum.find_index(origin, fn x -> x == head_c end)
        index_comp(changed, origin, current_index, total, find_index)
    end
  end
​
  def index_comp([_ | tail_c], origin, current_index, total, find_index) when find_index - current_index == 1 do
    # 修改 origin 数组 调换一个位置, total + 1
    {_, left_arr} = origin |> List.pop_at(find_index)
    compare_el(tail_c, left_arr, current_index, total + 1)
  end
  def index_comp([_ | tail_c], origin, current_index, total, find_index) when find_index - current_index == 2 do
    # 修改 origin 数组 调换一个位置, total + 2
    {_, left_arr} = origin |> List.pop_at(find_index)
    compare_el(tail_c, left_arr, current_index, total + 2)
  end
  def index_comp(_, _, current_index, _, find_index) when find_index - current_index > 2 do
    # 修改 origin 数组 调换一个位置
    IO.puts "Too chaotic"
  end
​
end
​
Solution.main()
​```

主体思路就是2个数组逐个比较元素

关键点： range to list, 参数解构，find_index , pop_at, 最开始的版本还有，insert_at