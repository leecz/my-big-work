---
title: pheonix 体系中的一些概念了解
date: 2018-12-24 23:54:57
tags: ["Phoenix"]
---

## Routing

路由系统，可以参照 Rails 的路由

在我的 HomeZone 项目下，初始生成的 路由文件 `lib/home_zone_web/router.ex`，如下：

```elixir
defmodule HomeZoneWeb.Router do
  use HomeZoneWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", HomeZoneWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", HomeZoneWeb do
  #   pipe_through :api
  # end
end
```

上面的 `use HomeZoneWeb, :router`， 引入 phoenix 的一些路由定义函数，下面的路由定义会用到。

`mix phx.routes` 查看生成的路由表


**scope** 的例子：

```elixir
scope "/admin", HelloWeb.Admin, as: :admin do
  pipe_through :browser

  resources "/images",  ImageController
  resources "/reviews", ReviewController
  resources "/users",   UserController
end
```

**pipeline**  `pipe_through :browser`

pipeline 是一些 plug 的有序排列。它们允许我们自定义与处理请求相关的行为和转换。Phoenix 提供了一些常用的 pipeline，可以根据实际需求来修改它们，或者创建新的。

请求： Endpoint -> pipeline




## Plug

Plug 是：
1. web 应用程序中可组合模块的规范；
2. Erlang VM 中不同 web 服务器之间的连接适配器；

