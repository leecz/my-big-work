---
title: "elixir 中的 GenServer"
date: 2018-02-01 22:56:26 +0800 
tags: ["elixir"]
---


翻译自 官方文档

一个 GemServer 有两个部分实现：client API 和 server callback。
你可以将他们同时写入一个模块或者分开都可以。client 和 server 运行来不同的进程，client 和 server 来回地发送消息。

来创建一个文件 `lib/kv/registry.ex` ：

```elixir
defmodule KV.Registry do
  use GenServer

  ## Client API
  @doc """
  Starts the registry.
  """
  def start_link(opts) do
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  @doc """
  Looks up the bucket pid for `name` stored in `server`.

  Returns `{:ok, pid}` if the bucket exists, `:error` otherwise.
  """
  def lookup(server, name) do
    GenServer.call(server, {:lookup, name})
  end

  @doc """
  Ensures there is a bucket associated with the given `name` in `server`.
  """
  def create(server, name) do
    GenServer.cast(server, {:create, name})
  end


  ## Server Callbacks

  def init(:ok) do
    {:ok, %{}}
  end

  def handle_call({:lookup, name}, _from, names) do
    {:reply, Map.fetch(names, name), names}
  end

  def handle_cast({:create, name}, names) do
    if Map.has_key?(names, name) do
      {:noreply, names}
    else
      {:ok, bucket} = KV.Bucket.start_link([])
      {:noreply, Map.put(names, name, bucket)}
    end
  end
end
```

第一个函数 `start_link/1`，新建了一个 GenServer：

1. server 回调定义的模块，`__MODULE__` 表示当前模块。
2. 初始化参数，这里是 `:ok`。
3. 一串选项值，列表类型，比如 name。

可以向 GenServer 发送两种类型的请求： calls 和 casts。
Calls 是同步的，server 必须给出响应。
Casts 是异步的，server 不必给出响应。

`lookup/2` 和 `create/2` 负责将上述请求发送给 server。
这里各自使用 `{:lookup, name}` 和 `{:create, name}`。
请求通常使用 tuple 格式的参数。通常是先指定 action 接着是 action 的参数。
不过要注意要与 `handle_call/3` 或者 `handle_cast/2` 的参数匹配上。

server 端则需要实现初始化、结束以及处理请求等等的回调函数。

首先是 `init/1` 回调，接收 `GenServer.start_link/3` 这个的第二个参数，返回 `{:ok, state}`。
不难发现，GenServer 让 client 和 server 分开。
`start_link/3` 是 client 的，`init/1` 是 server 的。

对于 `call/2` 请求，我们实现一个 `handle_call/3` 函数来处理，接收参数为这个 request，接收请求的这个进程(`_form`)，当前的 server state（`names`）。
`handle_call/3` 回调函数一个 tuple： `{:reply, reply, new_state}`。`:reply` 指明 server 需要给 client 一个 reply。`reply` 则是发送给 client 的内容，`new_state` 是 server 的新 state。

`cast/2` 请求，由 `handle_cast/2` 回调处理，接收参数为这个 request，和当前 server 的 state(`names`)。返回一个 tuple：`{:noreply, new_state}`。
注意在真实的应用中，我们一般为 `:create` 实现为同步而非异步。
还有 `terminate/2` 和 `code_change/3` 等内容，自己翻文档啊。


### 监控

`Process.monitor(pid)` 返回一个唯一的引用，让我们能匹配返回的信息。

```elixir
## Server callbacks

def init(:ok) do
  names = %{}
  refs  = %{}
  {:ok, {names, refs}}
end

def handle_call({:lookup, name}, _from, {names, _} = state) do
  {:reply, Map.fetch(names, name), state}
end

def handle_cast({:create, name}, {names, refs}) do
  if Map.has_key?(names, name) do
    {:noreply, {names, refs}}
  else
    {:ok, pid} = KV.Bucket.start_link([])
    ref = Process.monitor(pid)
    refs = Map.put(refs, ref, name)
    names = Map.put(names, name, pid)
    {:noreply, {names, refs}}
  end
end

def handle_info({:DOWN, ref, :process, _pid, _reason}, {names, refs}) do
  {name, refs} = Map.pop(refs, ref)
  names = Map.delete(names, name)
  {:noreply, {names, refs}}
end

def handle_info(_msg, state) do
  {:noreply, state}
end
```
