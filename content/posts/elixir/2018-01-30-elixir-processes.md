---
title: "elixir 中的进程"
date: 2018-01-30 22:56:26 +0800 
categories: elixir
tag: elixir
---

翻译自 官方文档，参考自 [elixir guide 中文]( https://github.com/elixir-lang-china/elixir_guide_cn/blob/master/getting_started/Chapter11.md)


## Process

在 Elixir 中，所有的代码在 process 中运行。

process 彼此隔离，同时运行，可传递消息。
process 是 Elixir 并发的基础，也是开发分布式和高容错程序的途径。


Elixir 中的 process 跟操作系统级的进程是完全不同的。
process 在内存和 CPU 的消耗上非常轻量，远不及进程，所以瞬间创建大量 process 是可能的。


### spawn

后面的进程指 Elixir 中的 process。

创建进程的函数 `spawn/1`，无需引入。用法很简单：

```elixir
iex> spawn fn -> 1 + 2 end
#PID<0.43.0>
```

返回值是一个 PID，进程的标识。
这个进程现在很可能已经死了，新建的进程会执行传入的函数，执行完毕后退出：


```elixir
iex> pid = spawn fn -> 1 + 2 end
#PID<0.44.0>
iex> Process.alive?(pid)
false
```

当前环境的 PID 使用 `self/0` 获取：

```elixir
iex> self()
#PID<0.41.0>
iex> Process.alive?(self())
true
```


### send and receive

使用 `send/2` 和 `receive/1` 来给进程发送和接收消息

```elixir
iex> send self(), {:hello, "world"}
iex> receive do
...>    {:hello, msg} -> msg
...>    {:world, msg} -> "won't match"
...> end
"world"
```

很好理解。
给进程发送的消息会存储在进程的信箱中。
收件人(receive) 会去信箱拿到这些信，然后处理自己想要的。
上面的例子也可以看出送信的进程不会阻塞，不会傻傻的等着那人有没有收到信，把信给到收件人的信箱，然后就自己该干嘛干嘛去了。

如果收件人没有等来想要的那封信，他会一直等下去，除非你告诉他，等多久就不等了：

```elixir
iex> receive do
...>   {:hello, msg}  -> msg
...> after
...>   1_000 -> "nothing after 1s"
...> end
"nothing after 1s"
```


自己给自己发多没意思啊
来创建个小号给自己发信息玩

```elixir
iex> parent = self()
#PID<0.41.0>
iex> spawn fn -> send(parent, {:hello, self()}) end
#PID<0.48.0>
iex> receive do
...>   {:hello, pid} -> "Got hello from #{inspect pid}"
...> end
"Got hello from #PID<0.48.0>"
```


### Links

在 Elixir 中，我们大多数时候都会使用 link 形式的进程(spawn_link/1)。
先看看使用 spawn 的不足：

```elixir
iex> spawn fn -> raise "oops" end
#PID<0.58.0>

[error] Process #PID<0.58.00> raised an exception
** (RuntimeError) oops
    (stdlib) erl_eval.erl:668: :erl_eval.do_apply/6
```

错误日志立即打印出来，不过父进程还是好好的运行着，这是因为进程都是相互隔离的。如果想要进程的异常跑出来，我们需要使用(spawn_link/1):

```elixir
iex> self()
#PID<0.41.0>
iex> spawn_link fn -> raise "oops" end

** (EXIT from #PID<0.41.0>) evaluator process exited with reason: an exception was raised:
    ** (RuntimeError) oops
        (stdlib) erl_eval.erl:668: :erl_eval.do_apply/6

[error] Process #PID<0.289.0> raised an exception
** (RuntimeError) oops
    (stdlib) erl_eval.erl:668: :erl_eval.do_apply/6
```

这次子进程的异常使得父进程也收到了一个 EXIT 的信号。IEx 智能的为此重新打开了一个 session。

进程以及连接的进程在高容错的系统中扮演了重要角色。Elixir 中的进程是彼此独立的，默认情况下不会共享任何数据。因此，一个进程的错误不会使其他进程崩溃或者改变状态。
但是，连接的进程使进程间的错误能关联起来。
我们常把进程连接到 supervisor，它能监测进程的死亡，还可以原地复活一个新的进程。

其他语言则是要求我们 `catch/handle` 异常。
在 Elixir 中，我们不需要，我们允许其出错，然后让 supervisor 会正确的重启该系统。"Failing fase" 是我们写代码的哲学！

`spawn/1` 和 `spawn_link/1` 是创建进程的基础。虽然我们已经使用了他们，但是大多数时候我们会使用构建于他们之上的抽象接口。比如 tasks。


### Tasks

Task 是基于 spwan 的，提供了更好的错误报告和内省：

```elixir
iex(1)> Task.start fn -> raise "oops" end
{:ok, #PID<0.55.0>}

15:22:33.046 [error] Task #PID<0.55.0> started from #PID<0.53.0> terminating
** (RuntimeError) oops
    (stdlib) erl_eval.erl:668: :erl_eval.do_apply/6
    (elixir) lib/task/supervised.ex:85: Task.Supervised.do_apply/2
    (stdlib) proc_lib.erl:247: :proc_lib.init_p_do_apply/3
Function: #Function<20.99386804/0 in :erl_eval.expr/5>
    Args: []
```

使用 `Task.start/1` 和 `Task.start_link/1` 返回 `{:ok, pid}` 而不仅仅是  PID。 这也使得 task 可以用于 supervision tree。
并且 Task 还提供了 `Task.async/1` 和 `Task.await/1` 等等有用的方法。


### state

如果你构建应用时需要使用 state。比如，记住程序的配置信息，或者你需要读取一个文件并将其存与内存中等等这些，你怎么存？

进程是最常用的。
可以让进程无限循环，维护 state，发送和接收消息。
来看这个例子，模拟一个 key-value 存储系统`kv.exs`：

```elixir
defmodule KV do
  def start_link do
    Task.start_link(fn -> loop(%{}) end)
  end

  defp loop(map) do
    receive do
      {:get, key, caller} ->
        send caller, Map.get(map, key)
        loop(map)
      {:put, key, value} ->
        loop(Map.put(map, key, value))
    end
  end
end
```

这段代码定义了一个函数 `start_link` 来创建一个进程，并且执行了 `loop/1` 函数，初始化了一个空的 map。然后 loop 函数等待接收信息然后执行相应的操作。主要是两个操作 `:get` 和 `:put`，然后再重新调用自身。

可以这样来测试, `iex kv.exs`：

```elixir
iex> {:ok, pid} = KV.start_link
{:ok, #PID<0.62.0>}
iex> send pid, {:get, :hello, self()}
{:get, :hello, #PID<0.41.0>}
iex> flush()
nil
:ok
```

木有数据对不对，放个数据看看：

```elixir
iex> send pid, {:put, :hello, :world}
{:put, :hello, :world}
iex> send pid, {:get, :hello, self()}
{:get, :hello, #PID<0.41.0>}
iex> flush()
:world
:ok
```

这就是使用进程来保存 state 的做法，通过给进程发送消息来读取和修改 state。
事实上，任何 知道 pid 的进程都可以对其发送消息。

所以可以注册这个 pid，给其命名，这样所有知道这个名字的都可以对其发送消息。

```elixir
iex> Process.register(pid, :kv)
true
iex> send :kv, {:get, :hello, self()}
{:get, :hello, #PID<0.41.0>}
iex> flush()
:world
:ok
```

使用进程来维护 state 并且为其命名是常用操作。显然，大多数时候我们不必像上面那样自己实现一套。Elixir 中，提供了 `agents`，就是用来管理状态的接口：

```elixir
iex> {:ok, pid} = Agent.start_link(fn -> %{} end)
{:ok, #PID<0.72.0>}
iex> Agent.update(pid, fn map -> Map.put(map, :hello, :world) end)
:ok
iex> Agent.get(pid, fn map -> Map.get(map, :hello) end)
:world
```

` Agent.start_link/2`  还有 `:name ` 选项。
除了 `agents` Elixir 还提供了 API 来构建通用服务 (`GenServer`)，tasks 等等，他们都是基于进程。后面学习 OTP 之后，还将学习更多。

