---
title: "elixir maps keyword lists sets and structs"
date: 2018-01-10 22:56:26 +0800 
categories: elixir
tag: elixir
---


## Maps, Keyword Lists, Sets, and Structs

### How to Choose Between Maps and Keyword Lists

1. 是否需要模式匹配？（比如匹配一个 key 为 :name 的 dictionary）如果是，使用 map。
2. 相同的 key 是否会使用多次？如果是，使用 keyword
3. 元素是否有顺序？如果是，使用 keyword
4. 如果都不是，使用map。

### Keyword Lists

Keyword 常用于传递给函数的 option。

```elixir
defmodule Canvas do
  @defaults [ fg: "black", bg: "white", font: "Merriweather" ]
  def draw_text(text, options \\ []) do
    options = Keyword.merge(@defaults, options)
    IO.puts "Drawing text #{inspect(text)}"
    IO.puts "Foreground: #{options[:fg]}"
    IO.puts "Background: #{Keyword.get(options, :bg)}"
    IO.puts "Font:  #{Keyword.get(options, :font)}"
    IO.puts "Pattern: #{Keyword.get(options, :pattern, "solid")}"
    IO.puts "Style: #{inspect Keyword.get_values(options, :style)}"
  end 
end
Canvas.draw_text("hello", fg: "red", style: "italic", style: "bold")
# =>
#   Drawing text "hello"
#   Foreground:  red
#   Background:  white
#   Font:        Merriweather
#   Pattern:     solid
#   Style:       ["italic", "bold"]
```

### Maps

Maps 是 `key/value` 类型的数据。

来玩玩：

```elixir
iex> map = %{ name: "Dave", likes: "Programming", where: "Dallas" }
%{likes: "Programming", name: "Dave", where: "Dallas"}
iex> Map.keys map
[:likes, :name, :where]
iex> Map.values map
["Programming", "Dave", "Dallas"]
iex> map[:name]
"Dave"
iex> map.name
"Dave"
iex> map1 = Map.drop map, [:where, :likes] 
%{name: "Dave"}
iex> map2 = Map.put map, :also_likes, "Ruby"
%{also_likes: "Ruby", likes: "Programming", name: "Dave", where: "Dallas"} 
iex> Map.keys map2
[:also_likes, :likes, :name, :where]
iex> Map.has_key? map1, :where
false
iex> { value, updated_map } = Map.pop map2, :also_likes
{"Ruby", %{likes: "Programming", name: "Dave", where: "Dallas"}}
iex> Map.equal? map, updated_map
true
```

### Pattern Matching and Updating Maps

对 Map 最常见的问题大概是，有某个key（或者 value ）吗？

person = %{ name: "Dave", height: 1.88}

- 有 key 为 :name 的条目吗？

```elixir
iex> %{ name: a_name } = person
%{height: 1.88, name: "Dave"}
iex> a_name
"Dave"
```

- 有 keys 为 :name 和 ：height 的条目吗？

```elixir
iex> %{ name: _, height: _ } = person
%{height: 1.88, anme: "Dave"}
```

- 有 key 为 :name 值为 "Dave" 的条目吗？
`iex> %{ name: "Dave" } = person`
`%{height: 1.88, name: "Dave"}`

- 有 key 为 :weight 的条目吗？没有，报错。

`iex> %{ name: _, weight: _ } = person`
`** (MatchError) no match of right hand side value: %{height: 1.88, name: "Dave"}`

我们使用 for 来遍历一个集合：

```elixir
people = [
  %{ name: "Grumpy", height: 1.24 },
  %{ name: "Dave", height: 1.88 },
  %{ name: "Dopey", height: 1.32 }, 
  %{ name: "Shaquille", height: 2.16 },
  %{ name: "Sneezy", height: 1.28 }
]
IO.inspect(for person = %{ height: height } <- people, height > 1.5, do: person)

# => [%{height: 1.88, name: "Dave"}, %{height: 2.16, name: "Shaquille"}]
```

下面这个函数参数的模式匹配：

```elixir
defmodule HotelRoom do
  def book(%{name: name, height: height}) when height > 1.9 do
    IO.puts "Need extra long bed for #{name}" 
  end
  def book(%{name: name, height: height}) when height < 1.3 do
    IO.puts "Need low shower controls for #{name}" 
  end
  def book(person) do
    IO.puts "Need regular bed for #{person.name}"
  end 
end
people |> Enum.each(&HotelRoom.book/1)
#=> Need low shower controls for Grumpy
#   Need regular bed for Dave
#   Need regular bed for Dopey
#   Need extra long bed for Shaquille
#   Need low shower controls for Sneezy
```

### Pattern Matching Can't Bind Keys

在模式匹配期间，你没法将一个值绑定到一个 key。你可以这样做：

```elixir
iex> %{ 2 => state } = %{ 1 => :ok, 2 => :error }
%{1 => :ok, 2 => :error}
iex> state
:error

# but not this
iex> %{ item => :ok } = %{ 1 => :ok, 2 => :error }
** (CompileError) iex:5: illegal use of variable item in map key...
```


### Pattern Matching Can Match Variable Keys

pin 操作：

```elixir
iex> data = %{ name: "Dave", state: "TX", likes: "Elixir" } 
%{likes: "Elixir", name: "Dave", state: "TX"}
iex> for key <- [ :name, :likes ] do
...> %{ ^key => value } = data
...> value
...> end
["Dave", "Elixir"]
```

### Updating a Map

Map 添加元素或者更新条目时不必遍历整个结构。不过和其他值一样，map 也是不可变的，所以，更新一个 map 时，返回的结果是一个新的 map。

最简单的更新 map 的方法是下面的方式：

`new_map = %{ old_map | key => value, ...}`

管道符号右侧的为需要更新的数据，不需要更新的旧数据和新数据组成一个新的 map 返回。

```elixir
iex> m = %{ a: 1, b: 2, c: 3 }
%{a: 1, b: 2, c: 3}
iex> m1 = %{ m | b: "two", c: "three" } 
%{a: 1, b: "two", c: "three"}
iex> m2 = %{ m1 | a: "one" }
%{a: "one", b: "two", c: "three"}
```

不过，这种方式不会添加新的 key，如果想加入新的 key ，你得使用 `Map.put_new/3` 方法。

### Structs

Map 仅仅是键值对的组合，如果我们想要一类 map -- 有固定的一些字段，并且这些字段有默认值，而且可以根据值或者类型来进行模式匹配，
这就是 struct 了。

struct 是有限的 map 组成的模块。key 必须为 atom。

模块名就是 map 的类型。使用 defstruct 宏定义。

来看例子吧。

```elixir
# defstruct.exs
defmodule Subscriber do
  defstruct name: "", paid: false, over_18: true
end
```

iex 中使用之：

```elixir
$ iex defstruct.exs
iex> s1 = %Subscriber{}
%Subscriber{name: "", over_18: true, paid: false} 
iex> s2 = %Subscriber{ name: "Dave" } 
%Subscriber{name: "Dave", over_18: true, paid: false} 
iex> s3 = %Subscriber{ name: "Mary", paid: true } 
%Subscriber{name: "Mary", over_18: true, paid: true}
```

创建 struct 很简单, 在 `%` 和 `{` 之间加上 struct 的名字，其他就跟创建 map 一样。

更新:

```elixir
iex> s4 = %Subscriber{ s3 | name: "Marie"} 
%Subscriber{name: "Marie", over_18: true, paid: true}
```

为什么用 module 来封装 structs ? 因为你可以在 module 定义跟 struct 相关的行为。

```elixir
# defstruct1.exs
defmodule Attendee do
  defstruct name: "", paid: false, over_18: true
  def may_attend_after_party(attendee = %Attendee{}) do
    attendee.paid && attendee.over_18
  end
  def print_vip_badge(%Attendee{name: name}) when name != "" do
    IO.puts "Very cheap badge for #{name}"
  end
  def print_vip_badge(%Attendee{}) do
    raise "missing name for badge"
  end
end

$ iex defstruct1.exs
iex> a1 = %Attendee{name: "Dave", over_18: true} 
%Attendee{name: "Dave", over_18: true, paid: false} 
iex> Attendee.may_attend_after_party(a1)
false
iex> a2 = %Attendee{a1 | paid: true} 
%Attendee{name: "Dave", over_18: true, paid: true} 
iex> Attendee.may_attend_after_party(a2)
true
iex> Attendee.print_vip_badge(a2)
Very cheap badge for Dave
:ok
iex> a3 = %Attendee{}
%Attendee{name: "", over_18: true, paid: false} 
iex> Attendee.print_vip_badge(a3)
** (RuntimeError) missing name for badge
     defstruct1.exs:13: Attendee.print_vip_badge/1
```

### Nested Dictionary Structures

嵌套的字典结构：

```elixir
#nested.exs
defmodule Customer do
  defstruct name: "", company: ""
end

defmodule BugReport do
  defstruct owner: %Customer{}, details: "", severity: 1
end

iex> report = %BugReport{owner: %Customer{name: "Dave", company: "Pragmatic"},details: "broken"}
%BugReport{details: "broken", severity: 1, owner: %Customer{company: "Pragmatic", name: "Dave"}}
```

更新值，如果采用之前的更新方法，对于嵌套的数据来说，那种方法不太方便，Elixir 有个 `put_in` 方法，用来更新嵌套的数据。

```elixir
iex> put_in(report.owner.company, "PragProg")
%BugReport{details: "broken"}
```

`update_in` 可以使用一个函数来更新数据：

```elixir
iex> update_in(report.owner.name, &("Mr. " <> &1))
%BugReport{details: "broken",
  owner: %Customer{company: "PragProg", name: "Mr. Dave"},
   severity: 1}
```

另外两个相关的方法为 `get_in 和 get_and_update_in`。

### Nested Accessors and Nonstructs

使用 atom 作为 key，来访问嵌套数据：

```elixir
iex> report = %{ owner: %{ name: "Dave", company: "Pragmatic" }, severity: 1}
%{owner: %{company: "Pragmatic", name: "Dave"}, severity: 1}
iex> put_in(report[:owner][:company], "PragProg")
%{owner: %{company: "PragProg", name: "Dave"}, severity: 1}
iex> update_in(report[:owner][:name], &("Mr. " <> &1))
%{owner: %{company: "Pragmatic", name: "Mr. Dave"}, severity: 1}
```

### Dynamic (Runtime) Nested Accessors

上面看到的嵌套访问器其实是 宏，他们在编译时已确定。所以非常有限，你没法动态的决定 key 是啥子。

不过， `get_in, put_in, get_and_update_in, update_in` 都是可以传参的。

举个例子：

```elixir
# dynamic_nested.exs
nested = %{ 
  buttercup: %{
    actor: %{
      first: "Robin", last: "Wright"
    },
    role: "princess"
  },
  westley: %{
    actor: %{
      first: "Cary", 
      last: "Ewles"
    },
    role: "farm boy"
  } 
}

IO.inspect get_in(nested, [:buttercup])
# => %{actor: %{first: "Robin", last: "Wright"}, role: "princess"}
IO.inspect get_in(nested, [:buttercup, :actor]) 
# => %{first: "Robin", last: "Wright"}
IO.inspect get_in(nested, [:buttercup, :actor, :first]) 
# => "Robin"
IO.inspect put_in(nested, [:westley, :actor, :last], "Elwes")
# => %{buttercup: %{actor: %{first: "Robin", last: "Wright"}, role: "princess"}, 
# => westley: %{actor: %{first: "Cary", last: "Elwes"}, role: "farm boy"}}

接收参数，就表示可以使用变量来传递参数，这就产生了无限可能呀。

```elixir
authors = [
  %{ name: "José", language: "Elixir" }, 
  %{ name: "Matz", language: "Ruby" }, 
  %{ name: "Larry", language: "Perl" }
]
languages_with_an_r = fn (:get, collection, next_fn) -> 
  for row <- collection do
    if String.contains?(row.language, "r") do 
      next_fn.(row)
    end 
  end
end

IO.inspect get_in(authors, [languages_with_an_r, :name])
#=> [ "José", nil, "Larry" ]
```

### The Access Module

Access 模块预定义了很多函数用于 get 和 `get_and_update_in` 的参数。类似于过滤器。
`all` 和 `at` 函数只能用于 list。

```elixir
cast = [ 
  %{
    character: "Buttercup", 
    actor: %{
      first: "Robin",
      last:  "Wright"
    },
    role: "princess"
  }, 
  %{
    character: "Westley", 
    actor: %{
      first: "Cary",
      last:  "Elwes"
    },
    role: "farm boy"
  } 
]

IO.inspect get_in(cast, [Access.all(), :character]) 
#=> ["Buttercup", "Westley"]

IO.inspect get_in(cast, [Access.at(1), :role]) 
#=> "farm boy"

IO.inspect get_and_update_in(cast, [Access.all(), :actor, :last],
                  fn (val) -> {val, String.upcase(val)} end)


#=> {["Wright", "Ewes"], 
# [%{actor: %{first: "Robin", last: "WRIGHT"}, character: "Buttercup", role: "princess"}, 
# %{actor: %{first: "Cary", last: "EWES"}, character: "Westley", role: "farm boy"}]}

```

`elem` 函数作用于 tuples:

```elixir
cast = [
  %{
    character: "Buttercup",
    actor: {"Robin", "Wright"}, 
    role: "princess"
  },
  %{
    character: "Westley",
    actor: {"Carey", "Elwes"}, 
    role: "farm boy"
  }
]

IO.inspect get_in(cast, [Access.all(), :actor, Access.elem(1)]) 
#=> ["Wright", "Elwes"]

IO.inspect get_and_update_in(cast, [Access.all(), :actor, Access.elem(1)], 
          fn (val) -> {val, String.reverse(val)} end)
#=> {["Wright", "Elwes"],
#    [%{actor: {"Robin", "thgirW"}, character: "Buttercup", role: "princess"},
#     %{actor: {"Carey", "sewlE"}, character: "Westley", role: "farm boy"}]}

`key` 和 `key!` 函数作用于字典类型（ maps and structs )

```elixir
cast = %{
  buttercup: %{
    actor: {"Robin", "Wright"},
    role: "princess"
  },
  westley: %{
    actor: {"Carey", "Elwes"},
    role: "farm boy"
  }
}

IO.inspect get_in(cast, [Access.key(:westley), :actor, Access.elem(1)]) 
#=> "Elwes"

IO.inspect get_and_update_in(cast, [Access.key(:buttercup), :role], fn (val) -> {val, "Queen"} end)

#=> {"princess",
#    %{buttercup: %{actor: {"Robin", "Wright"}, role: "Queen"},
#      westley: %{actor: {"Carey", "Elwes"}, role: "farm boy"}}}
```

最后 `Access.pop` 用于删除条目，作用于 map 或者 keyword。

```elixir

iex> Access.pop(%{name: "Elixir", creator: "Valim"}, :name) 
{"Elixir", %{creator: "Valim"}}
iex> Access.pop([name: "Elixir", creator: "Valim"], :name) 
{"Elixir", [creator: "Valim"]}
iex> Access.pop(%{name: "Elixir", creator: "Valim"}, :year) 
{nil, %{creator: "Valim", name: "Elixir"}}
```

### Sets

MapSet 模块实现了 sets。

```elixir
iex> set1 = 1..5 |> Enum.into(MapSet.new) 
#MapSet<[1, 2, 3, 4, 5]>
iex> set2 = 3..8 |> Enum.into(MapSet.new) 
#MapSet<[3, 4, 5, 6, 7, 8]>
iex> MapSet.member? set1, 3
true
iex> MapSet.union set1, set2 
#MapSet<[1, 2, 3, 4, 5, 6, 7, 8]> 
iex> MapSet.difference set1, set2 
#MapSet<[1, 2]>
iex> MapSet.difference set2, set1 
#MapSet<[6, 7, 8]>
iex> MapSet.intersection set2, set1 
#MapSet<[3, 4, 5]>
```

### With Great Power Comes Great Temptation

字典的用途宽广，功能强大，但也不要乱用啊。

不要把 struct 和 module 当做面向对象语言中的 class。

保持纯净，年轻人，保持纯净。
