---
title: Phoenix Guide Channels 翻译
date: 2018-12-25 23:14:57
tags:
- elixir
- phoenix
- channels
---


Channels 是 Phoenix 中对 Web 实时通讯技术的一种封装

客户端连接，然后订阅一个或多个 Topic ，不管是服务端还是客户端给这个 Topic 发消息，订阅这个 Topic 的都将接收到消息。

### Overview

要建立通讯，客户端需要与服务器端的一个节点建立连接，使用 websockets 或者 长轮询，加入一个或多个 channel 都使用同一个网络连接。每个客户端，每个 Topic 都会创建一个 channel 服务端进程。

当连接建立，服务端收到的每个消息，会根据 topic 路由到正确的 channel server。

如果群集中还有其他节点，则本地PubSub还会将消息转发到其PubSub，后者将其发送给自己的订阅者。因为每个附加节点只需要发送一条消息，所以添加节点的性能成本可以忽略不计，而每个新节点支持更多的用户。

消息流如下图：

```javascript
                                 Channel   +-------------------------+      +--------+
                                  route    | Sending Client, Topic 1 |      | Local  |
                              +----------->|     Channel.Server      |----->| PubSub |--+
+----------------+            |            +-------------------------+      +--------+  |
| Sending Client |-Transport--+                                                  |      |
+----------------+                         +-------------------------+           |      |
                                           | Sending Client, Topic 2 |           |      |
                                           |     Channel.Server      |           |      |
                                           +-------------------------+           |      |
                                                                                 |      |
                                           +-------------------------+           |      |
+----------------+                         | Browser Client, Topic 1 |           |      |
| Browser Client |<-------Transport--------|     Channel.Server      |<----------+      |
+----------------+                         +-------------------------+                  |
                                                                                        |
                                                                                        |
                                                                                        |
                                           +-------------------------+                  |
+----------------+                         |  Phone Client, Topic 1  |                  |
|  Phone Client  |<-------Transport--------|     Channel.Server      |<-+               |
+----------------+                         +-------------------------+  |   +--------+  |
                                                                        |   | Remote |  |
                                           +-------------------------+  +---| PubSub |<-+
+----------------+                         |  Watch Client, Topic 1  |  |   +--------+  |
|  Watch Client  |<-------Transport--------|     Channel.Server      |<-+               |
+----------------+                         +-------------------------+                  |
                                                                                        |
                                                                                        |
                                           +-------------------------+      +--------+  |
+----------------+                         |   IoT Client, Topic 1   |      | Remote |  |
|   IoT Client   |<-------Transport--------|     Channel.Server      |<-----| PubSub |<-+
+----------------+                         +-------------------------+      +--------+

```

### endpoint
在你的 Phoenix 应用中的 Endpoint 模块内，socket 定义了基于 URL 的 socket 处理方式。

```elixir
socket "/socket", HelloWeb.UserSocket
  websocket: true,
  longpoll: false
Socket Handlers
```

当Phoenix建立通道连接时，将调用 socket 处理程序，例如上例中的 `HelloWeb.UserSocket`。根据您的 endpoint 配置，与给定URL的连接将全部使用相同的 socket 处理程序。但该处理程序可用于设置任意数量 topic 的连接。 在处理程序中，您可以验证和识别 socket 连接并设置默认 socket assigns。

### Channel Routes
channel routes 定义在 socket 处理程序中，例如 `HelloWeb.UserSocket`，根据 topic 字符串来匹配，然后分发到给定的 Channel module 上。

`*` 星号为通配符，匹配所有。比如下面的 `room:lobby` 和 `room:123` 都会匹配到 RoomChannel 来处理。

`channel "room:*", HelloWeb.RoomChannel`

### Channels
Channels 处理来自客户端的事件，因此它们与 Controller 类似，但有两个主要区别。Channel 事件可以同时进行 - incoming 和 outgoing 。Channel 连接也会持续超过单个 request/response 周期。Channel 是 Phoenix 中实时通信组件的最高级抽象。

每个 Channel 都会实现如下4个函数的一个或多个函数分身：

`join/3, terminate/2, handle_in/3, handle_out/3 `

### Topics
Topic 是字符串标识符-按顺序分层确保消息到达正确的位置。如上所述，topic 可以使用通配符。可以使用 `"topic:subtopic"`  这种约定。通常，你会根据你的应用来使用记录ID作为topic的一部分，比如：`"users:123"`。

### Messages
`Phoenix.Socket.Message` 模块使用如下的 key 来定义一个合法的结构体：

- topic: topic 的名字
- event: 事件名，比如： "phx_join" 
- payload: message 载体
- ref: the unique string ref


### PubSub
通常，在开发 Phoenix 应用程序时，我们不直接使用Phoenix PubSub层。而它通常在 Phoenix 框架内部使用。但我们可能需要配置它。

PubSub由 `Phoenix.PubSub` 模块和各种适配器及其 GenServers 的模块组成。这些模块包含组织 Channel 通信的基本功能 - 订阅主题，取消订阅主题，以及广播主题消息。

PubSub系统还负责将消息从一个节点传递到另一个节点，以便可以将其发送到整个群集中的所有订户。默认情况下，这是使用 `Phoenix.PubSub.PG2` 完成的，它使用原生 BEAM 消息传递。

如果您的部署环境不支持分布式Elixir或服务器之间的直接通信，Phoenix还附带一个Redis适配器，该适配器使用Redis交换PubSub数据。有关更多信息，请参阅Phoenix.PubSub文档。


## Trying it all together

一起来将上面的这些想法实际应用起来。

在新生成的项目中，endpoint 已经做好了相关设置 lib/hello_web/endpoint.ex：

```elixir
defmodule HelloWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :hello
  socket "/socket", HelloWeb.UserSocket
  ...
end
```

在 `lib/hello_web/channels/user_socket.ex` , `HelloWeb.UserSocket`  模块已经创建，我们只需要将消息路由到正确的 channel：

```elixir
defmodule HelloWeb.UserSocket do
  use Phoenix.Socket
​
## Channels
  channel "room:*", HelloWeb.RoomChannel
  ...
```

现在，客户端以 `"room:"` 开头的 topic 都会由 RoomChannel 来处理。

### Joining Channels
首先验证客户端是否有权限加入这个 topic。对于鉴权，我们需要实现 `join/3` 函数，编辑 `lib/hello_web/channels/room_channel.ex` 。

```elixir
defmodule HelloWeb.RoomChannel do
  use Phoenix.Channel
​
  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end
  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end
end
```

现在，让 `room:lobby`  topic 是所有人都可以加入的，其他 room 是限制加入的。

允许加入，我们使用 `{:ok, socket}` 或者 `{:ok, reply, socket}` 。

拒绝加入，我们使用 `{:error, reply}` 。

客户端， `assets/js/socket.js`  定义了一个小小的客户端库。

我们使用这个库来连接 socket 和 加入 channel，我们只需要将topic 的名字改为 `"room:lobby"` ：

```elixir
// assets/js/socket.js
...
socket.connect()
​
// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("room:lobby", {})
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })
​
export default socket
```

然后需要把 `assets/js/socket.js` 文件引入 `application javascript` 文件中。在 `assets/js/app.js` 中把下面这行的注释打开：

```javascript
...
import socket from "./socket"
```

保存，然后就可以在浏览器中的 console 中看到打印信息： “Joined successfully”。客户端和服务端就建立起了持久连接。

在 `lib/hello_web/templates/page/index.html.eex` 中写入：

```html
<div id="messages"></div>
<input id="chat-input" type="text"></input>
```

然后在 `assets/js/socket.js` 中加入事件监听：

```javascript
...
let channel           = socket.channel("room:lobby", {})
let chatInput         = document.querySelector("#chat-input")
let messagesContainer = document.querySelector("#messages")

chatInput.addEventListener("keypress", event => {
  if(event.keyCode === 13){
    channel.push("new_msg", {body: chatInput.value})
    chatInput.value = ""
  }
})

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket
```

我们监听了 input 的键盘回车事件，事件触发则向 channel `push` 一个事件，并将数据传过去。事件名为 `new_msg`。然后还得处理其他地方来的消息，需要将其显示出来：

```javascript
...
let channel           = socket.channel("room:lobby", {})
let chatInput         = document.querySelector("#chat-input")
let messagesContainer = document.querySelector("#messages")

chatInput.addEventListener("keypress", event => {
  if(event.keyCode === 13){
    channel.push("new_msg", {body: chatInput.value})
    chatInput.value = ""
  }
})

channel.on("new_msg", payload => {
  let messageItem = document.createElement("li")
  messageItem.innerText = `[${Date()}] ${payload.body}`
  messagesContainer.appendChild(messageItem)
})

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket
```

我们使用 `channel.on` 监听了 `new_msg` 事件，然后将收到的消息放在 dom 上显示。现在该处理服务端的逻辑了。

### Incoming Events

使用 `handle_in/3` 来处理输入的时间。可以在事件名上使用模式匹配，然后获取 payload。
在这个 chat 程序中，我们只需要将获得的数据使用 `broadcast!/3` 函数广播到所有订阅了 `room:lobby` 的客户端上。

```elixir
defmodule HelloWeb.RoomChannel do
  use Phoenix.Channel

  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end
  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    broadcast!(socket, "new_msg", %{body: body})
    {:noreply, socket}
  end
end
```

`broadcast!/3` 将消息广播给所有加入了该 topic 的客户端，并调用 `handle_out/3` 回调。
`handle_out/3` 不是必须的回调，但是能让我们在消息到达客户端之前自定义和过滤广播。

### Intercepting Outgoing Events

这里不会实现该功能，但是想象一下 chat 程序中，允许用户屏蔽 新用户加入房间的消息 的功能。
要实现这个就得用到 `handle_out/3` 函数。

```elixir
intercept ["user_joined"]

def handle_out("user_joined", msg, socket) do
  if Accounts.ignoring_user?(socket.assigns[:user], msg.user_id) do
    {:noreply, socket}
  else
    push(socket, "user_joined", msg)
    {:noreply, socket}
  end
end
```

### Socket Assigns

和 连接体 类似，`%Plug.Conn{}`, channel socket 也可以使用 assign value。
`Phoenix.Socket.assign/3` 就用于此：

```elixir
socket = assign(socket, :user, msg["user"])
```

存储结构为 Map。

### Using Token Authentication

连接的时候，通常需要校验客户端是否合法，我们使用 Phoenix.Token 4 不走。

#### Step 1 - Assign a Token in the Connection

假设我们有一个叫 OurAuth 的认证 plug。使用 OurAuth 来验证用户时，它给 `conn.assigns` 中的 `:current_user` 赋值。 由于 `current_user` 存在，我们可以很方便的在连接中设置 token，以便 layout 中使用。我们可以在私有函数 plug `put_user_token/2` 中包含该行为。这也可以放在自己的模块中。为了使这一切正常，我们只需将 OurAuth 和 `put_user_token/2` 添加到 browser pipeline 。

```elixir
pipeline :browser do
  # ...
  plug OurAuth
  plug :put_user_token
end

defp put_user_token(conn, _) do
  if current_user = conn.assigns[:current_user] do
    token = Phoenix.Token.sign(conn, "user socket", current_user.id)
    assign(conn, :user_token, token)
  else
    conn
  end
end
```

现在 `conn.assigns` 就包含了 `current_user` 和 `user_token`。

#### Step 2 - Pass the Token to the JavaScript

然后我们需要将 token 传递到 JavaScript 中。可以在 `web/templates/layout/app.html.eex` 中的 script 标签中做此事。在 app.js 之上写入：

```js
<script>window.userToken = "<%= assigns[:user_token] %>";</script>
<script src="<%= Routes.static_path(@conn, "/js/app.js") %>"></script>
```

#### Step 3 - Pass the Token to the Socket Constructor and Verify

我们还需要将：params传递给 socket 构造函数并验证 `connect/3` 函数中的 token。编辑 `web/channels/user_socket.ex` ：

```elixir
def connect(%{"token" => token}, socket, _connect_info) do
  # max_age: 1209600 is equivalent to two weeks in seconds
  case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
    {:ok, user_id} ->
      {:ok, assign(socket, :current_user, user_id)}
    {:error, reason} ->
      :error
  end
end
```


在我们的 JavaScript 中，我们使用先前设置的 token， 将其 传递给构建 Socket 的函数：

```js
let socket = new Socket("/socket", {params: {token: window.userToken}})
```

#### Step 4 - Connect to the socket in JavaScript

设置好认证后，我们可以使用 js 来连接 sockets 和 channel：

```javascript
let socket = new Socket("/socket", {params: {token: window.userToken}})
socket.connect()
```

连接建立，可以使用 topic 加入 channel：

```javascript
let channel = socket.channel("topic:subtopic", {})
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket
```

#### Fault Tolerance and Reliability Guarantees

服务器重启，网络分裂，客户端失去连接。为了设计强大的系统，我们需要了解 Phoenix 如何应对这些事件以及它提供的保障。

### Handling Reconnection

客户端订阅主题，Phoenix 将这些订阅存储在内存中的 ETS 表中。如果频道崩溃，客户端将需要重新连接到之前订阅的主题。幸运的是，Phoenix JavaScript 客户端知道如何执行此操作。服务器将崩溃通知给所有客户端。这将触发每个客户端的 `Channel.onError` 回调。客户端将尝试使用 指数退避策略 重新连接到服务器。一旦他们重新连接，他们将尝试重新加入他们之前订阅的主题。如果它们成功，它们将像以前一样开始接收来自这些主题的消息。

###  Resending Client Messages

通道客户端将传出消息排队到 PushBuffer 中，并在有连接时将它们发送到服务器。如果没有可用的连接，客户端将保留消息，直到它可以建立新连接。如果没有连接，客户端将把消息保存在内存中，直到它建立连接，或者直到它收到超时事件。默认超时设置为5000毫秒。客户端不会将消息保留在浏览器的本地存储中，因此如果浏览器选项卡关闭，消息将消失。

### Resending Server Messages

在向客户发送消息时，Phoenix 使用最多一次的策略。如果客户端处于脱机状态并且错过了该消息，Phoenix 将不会重新发送该消息。 Phoenix 不会在服务器上保留消息。如果服务器重新启动，则未发送的消息将消失。如果我们的应用程序需要更强的保证消息传递，我们需要自己编写代码。常见方法涉及在服务器上保留消息并让客户端请求丢失消息。有关示例，请参阅Chris McCord的Phoenix培训：客户端代码和服务器代码。

### Example Application
上面的例子可以到这里查看: [phoenix_chat_example](https://github.com/chrismccord/phoenix_chat_example)

在线 demo：  http://phoenixchat.herokuapp.com/.

### 完结！