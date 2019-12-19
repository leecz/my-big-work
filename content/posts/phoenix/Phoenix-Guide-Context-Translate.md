---
title: Phoenix Guide Contexts Translate
date: 2018-12-27 22:14:23
tags: ["elixir", "Phoenix"]
---



到目前为止，我们已经构建了页面，通过我们的路由器连接 Controller 和 Actions ，并了解了 Ecto 如何验证和存储数据。 现在是时候将这些东西整合起来，使用 Elixir 来编写 Web 的一些功能。

在构建Phoenix项目时，我们首先构建一个 Elixir 应用程序。 Phoenix 的工作是为我们的 Elixir 应用程序提供 Web 接口。 当然，我们使用模块和函数组合我们的应用程序，但在设计应用程序时仅仅定义具有一些功能的模块是不够的。在编写代码时考虑应用程序设计至关重要。 让我们来看看如何。


### Thinking about design
Contexts 是专门用于暴露和组织相关功能的模块。 例如，无论何时调用 Elixir 的标准库，无论是 `Logger.info/1` 还是 `Stream.map/2`，您都在访问不同的 Contexts。 在内部，Elixir 的 logger 由多个模块组成，例如 `Logger.Config` 和 `Logger.Backends`，但我们从不直接与这些模块交互。 我们将 `Logger` 模块称为 context ，因为它暴露并组合了所有日志记录功能。

Phoenix 项目的结构类似于 Elixir 和任何其他 Elixir 项目 - 我们将代码分解为 context。 context 将组合相关功能，例如帖子和评论，通常封装模式，如数据访问和数据验证。 通过使用 context 我们将系统分离，隔离成可管理的独立部分。

让我们使用这些想法来构建我们的Web应用程序。 我们的目标是构建用户系统也是用于添加和编辑页面内容的内容管理系统。 让我们开始吧！

###  Adding an Accounts Context
用户帐户通常在整个平台上广泛使用，因此提前考虑编写定义明确的接口是很重要的。 考虑到这一点，我们的目标是构建一个帐户 API，用于处理用户帐户的创建，更新和删除，以及验证用户凭据。 我们将从基本功能开始，但随着我们稍后添加身份验证，我们将看到如何从稳固的基础开始，然后慢慢添加功能，自然地扩展应用程序。

Phoenix 包含 `phx.gen.html`，`phx.gen.json` 和 `phx.gen.context` 生成器，它们将我们的应用程序中的功能分离到 context 中。 这些生成器是一种很好的方式让 Phoenix 推动您朝着正确的方向拓展您的程序。 我们将这些工具用于我们的新用户帐户上下文。

为了运行 context 生成器，我们需要提供一个模块名称，该名称对我们正在构建的相关功能进行分组。 在 Ecto 指南中，我们看到了如何使用 Changesets 和 Repos 来验证和存储用户 schemas，但我们没有将它与我们的应用程序整合在一起。 事实上，我们并没有考虑应用程序中的 `user` 在哪里存在。 让我们退一步思考系统的不同部分。 我们知道我们的产品会有用户。 与用户常用的有提供帐户登录授权和用户注册等功能。 我们系统中的 `Accounts` 上下文自然就是用户相关功能的栖身之所。

> 命名是个难题，在没有清晰的名字的时候，可以先使用资源的复试形式来给 Context 命名

在我们使用生成器之前，我们需要撤消在 Ecto 指南中所做的更改，这样我们就可以为 user schema 提供合适的家。 运行这些命令以撤消我们以前的工作：

```bash
$ rm lib/hello/user.ex
$ rm priv/repo/migrations/*_create_users.exs
```

接下来，让我们重置数据库，这样我们也会丢弃刚删除的表：

```elixir
$ mix ecto.reset
Generated hello app
The database for Hello.Repo has been dropped
The database for Hello.Repo has been created

14:38:37.418 [info]  Already up
```

现在我们已准备好创建我们的 user context。 我们将使用 `phx.gen.html` 任务创建一个 context 模块，该模块包含用于创建，更新和删除用户的 Ecto 访问权限，以及用于 Web 界面的 controller 和 template 等Web文件到我们的上下文中。 在项目根目录运行以下命令：

```elixir
$ mix phx.gen.html Accounts User users name:string \
username:string:unique

* creating lib/hello_web/controllers/user_controller.ex
* creating lib/hello_web/templates/user/edit.html.eex
* creating lib/hello_web/templates/user/form.html.eex
* creating lib/hello_web/templates/user/index.html.eex
* creating lib/hello_web/templates/user/new.html.eex
* creating lib/hello_web/templates/user/show.html.eex
* creating lib/hello_web/views/user_view.ex
* creating test/hello_web/controllers/user_controller_test.exs
* creating lib/hello/accounts/user.ex
* creating priv/repo/migrations/20170629175236_create_users.exs
* creating lib/hello/accounts/accounts.ex
* injecting lib/hello/accounts/accounts.ex
* creating test/hello/accounts/accounts_test.exs
* injecting test/hello/accounts/accounts_test.exs

Add the resource to your browser scope in lib/hello_web/router.ex:

    resources "/users", UserController


Remember to update your repository by running migrations:

    $ mix ecto.migrate
```

Phoenix 按照预期在 `lib/hello_web/` 中生成了 Web 相关文件。我们还看到 context 文件在 `lib/hello/accounts/` 目录下生成。注意 `lib/hello` 和 `lib/hello_web` 之间的区别。我们有一个`Accounts` 模块作为帐户功能的公共 API ，以及一个 `Accounts.User` 结构，它是一个用于转换和验证用户帐户数据的Ecto schema。 Phoenix 还为我们提供了 web 和 context 测试，我们将在稍后介绍。 现在，让我们按照说明在`lib/hello_web/router.ex` 中根据控制台指令添加路由：

```elixir
  scope "/", HelloWeb do
    pipe_through :browser

    get "/", PageController, :index
    resources "/users", UserController
  end
```

设置好新 route, Phoenix 提醒我们执行 `mix ecto.migrate` 来更新 repo。现在：

```elixir
$ mix ecto.migrate

[info]  == Running Hello.Repo.Migrations.CreateUsers.change/0 forward

[info]  create table users

[info]  create index users_username_index

[info]  == Migrated in 0.0s
```

在查看新代码之前，我们先运行 `mix phx.server` 来启动服务，然后访问 `http://localhost:4000/users`, 点击 `New User`, 不输入任何信息，将会得到下面的提示：

> Oops, something went wrong! Please check the errors below.

当我们提交表单时，我们可以看到与输入内联的所有验证错误。太好了！ 开箱即用，上下文生成器在表单模板中包含了架构字段，我们可以看到我们对所需输入的默认验证有效。 让我们输入一些示例用户数据并重新提交表单：

```elixir
User created successfully.

Show User
Name: Chris McCord
Username: chrismccord
```

如果我们按照 "Back" 链接，我们会得到所有用户的列表，其中应包含我们刚刚创建的用户。 同样，我们可以更新此记录或删除它。 现在我们已经看到它在浏览器中的工作原理，现在是时候看一下生成的代码了。

### Starting With Generators

这个小小的 `phx.gen.html` 命令令人惊讶。 我们获得了许多开箱即用的功能，可用于创建，更新和删除用户。 虽然这远不是一个功能齐全的应用程序，但请记住，生成器首先是学习工具，也是您开始构建真实功能的起点。 代码生成无法解决您的所有问题，但它会教您 Phoenix 的细节，并在设计应用程序时将您推向正确的思维模式。

先来看看 `UserController`, 在 `lib/hello_web/controllers/user_controller.ex`:

```elixir
defmodule HelloWeb.UserController do
  use HelloWeb, :controller

  alias Hello.Accounts
  alias Hello.Accounts.User

  def index(conn, _params) do
    users = Accounts.list_users()
    render(conn, "index.html", users: users)
  end

  def new(conn, _params) do
    changeset = Accounts.change_user(%User{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"user" => user_params}) do
    case Accounts.create_user(user_params) do
      {:ok, user} ->
        conn
        |> put_flash(:info, "User created successfully.")
        |> redirect(to: Routes.user_path(conn, :show, user))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end
  ...
end
```

我们已经在 Controller guide 中看过 Controller 是如何工作的，所以代码可能并不太令人陌生。值得注意的是我们的控制器如何调用 `Accounts` 上下文。我们可以看到 index action 使用 `Accounts.list_users/0` 获取用户列表，以及如何使用 `Accounts.create_user/1` 在创建操作中存储用户。我们还没有查看 accounts context，因此我们还不知道用户获取和创建是如何发生的 - 但这就是重点。*我们的 Phoenix 控制器是我们更大应用程序的 Web 接口。它不应该关注如何从数据库中取出用户或持久存储到存储中的详细信息。我们只关心让我们的应用程序为我们执行一些工作。这很好，因为我们的业务逻辑和存储细节与我们的应用程序的 Web 层分离。如果我们稍后转移到全文存储引擎来获取用户而不是 SQL 查询，则不需要更改我们的控制器。同样，我们可以从应用程序中的任何其他接口重用我们的上下文代码，无论是通道，混合任务还是导入CSV数据的长时间运行进程。*

在我们的create action的情况下，当我们成功创建用户时，我们使用 `Phoenix.Controller.put_flash/2` 来显示成功消息，然后我们重定向到 `user_path` 的显示页面。 相反，如果 `Accounts.create_user/1`失败，我们将呈现 "new.html" 模板并传递模板的 Ecto 变更集以提取错误消息。

下一步，深入 Account context, 查看 `lib/hello/accounts/accounts.ex`:

```elixir
defmodule Hello.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Hello.Repo

  alias Hello.Accounts.User

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    Repo.all(User)
  end
  ...
end
```

此模块将是我们系统中所有帐户功能的公共API。例如，除了用户帐户管理之外，我们还可以处理用户登录验证，帐户首选项和密码重置生成。如果我们查看 `list_users/0` 函数，我们可以看到用户获取的私有细节。它非常简单。我们调用了 `Repo.all(user)`。我们在Ecto指南中看到了 Ecto repo 查询的工作方式，因此这个调用看起来应该很熟悉。我们的`list_users` 函数是一个通用函数，代码意图明确 - 即列出用户。我们使用 Repo 从 PostgreSQL 数据库中获取用户的详细信息对我们的调用者是隐藏的。当我们使用 Phoenix 生成器时，这是一个我们将重复看到的主题。 Phoenix 将推动我们思考应用程序中不同位置具有不同职责，然后将这些不同的区域包含在命名良好的模块和函数之后，这些模块和函数使代码的目的清晰，同时封装了详细信息。

现在我们知道如何获取数据，但用户如何持久化？ 我们来看看 `Accounts.create_user/1` 函数:

```elixir
  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end
```

这里有比代码更多的文档，但有几点需要强调。 首先，我们可以再次看到我们的 Ecto Repo 用于数据库访问。 您可能还注意到对 `User.changeset/2` 的调用。 我们之前讨论过变更集，现在我们在上下文中看到它们正在运行。

如果我们在 `lib/hello/accounts/user.ex` 中打开 User schema，一看上去很相似：

```elixir
defmodule Hello.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias Hello.Accounts.User


  schema "users" do
    field :name, :string
    field :username, :string

    timestamps()
  end

  @doc false
  def changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:name, :username])
    |> validate_required([:name, :username])
    |> unique_constraint(:username)
  end
end
```

这正是我们之前运行 `mix phx.gen.schema` 任务时所看到的，除了我们在`changeset/2` 函数上面看到 `@doc false`。 这告诉我们虽然这个函数是可对外调用的，但它不是公共上下文 API 的一部分。 调用者通过上下文API来构建 changesets。 例如，`Accounts.create_user/1` 调用 `User.changeset/2` 以从用户输入构建 changeset。 调用者（例如我们的控制器操作）不直接访问 `User.changeset/2`, 与我们的 user changeset 的所有交互都通过公共 Account 上下文完成。

###  In-context Relationships

我们的基本用户帐户功能很不错，但让我们通过支持用户登录凭据来提升一个档次。 我们不会实现完整的身份验证系统，但我们会给自己一个良好的开端来构建这样一个系统。 许多身份验证解决方案以一对一的方式将用户凭据耦合到帐户，但这通常会导致问题。 例如，支持不同的登录方法（例如社交登录或恢复电子邮件地址）将导致主要的代码更改。 让我们设置一个凭据关联，这将允许我们开始跟踪每个帐户的单个凭据，但稍后可以轻松支持更多功能。

目前，用户凭据仅包含电子邮件信息。 我们的第一个工作是决定凭证在应用中的位置。 我们有 Accounts 上下文，用于管理用户帐户。 用户凭据非常适合放这里。 Phoenix 也足够聪明，可以在现有的上下文中生成代码，这使得为上下文添加新资源变得轻而易举。 在项目根目录运行以下命令：

```elixir
$ mix phx.gen.context Accounts Credential credentials \
email:string:unique user_id:references:users

* creating lib/hello/accounts/credential.ex
* creating priv/repo/migrations/20170629180555_create_credentials.exs
* injecting lib/hello/accounts/accounts.ex
* injecting test/hello/accounts/accounts_test.exs

Remember to update your repository by running migrations:

$ mix ecto.migrate
```

这一次，我们使用了 `phx.gen.context` 任务，就像 `phx.gen.html` 一样，除了它不为我们生成Web文件。 由于我们已经拥有用于管理用户的控制器和模板，因此我们可以将新的凭据功能集成到现有的Web表单中。

我们可以从输出中看到 Phoenix 为 Accounts.Credential schema 生成了 `accounts/credential.ex` 文件，以及 migration 。 值得注意的是，Phoenix 说它是在现有的 `accounts/accounts.ex` 上下文文件和测试文件中注入代码。 由于我们的 Accounts 模块已经存在，Phoenix 知道在这里注入我们的代码。

在运行 migration 之前，我们需要对生成的迁移进行一次更改，以强制实施用户帐户凭据的数据完整性。 在我们的示例中，我们希望在删除父用户时,同时删除用户的凭据。 在 `priv/repo/migrations/` 中对 `*_create_credentials.exs` 迁移文件进行以下更改：

```elixir
  def change do
    create table(:credentials) do
      add :email, :string
-     add :user_id, references(:users, on_delete: :nothing)
+     add :user_id, references(:users, on_delete: :delete_all),
+                   null: false

      timestamps()
    end

    create unique_index(:credentials, [:email])
    create index(:credentials, [:user_id])
  end
```

*我们将 `:on_delete` 选项从 `:nothing` 更改为 `:delete_all`，这将生成一个外键约束，当用户从数据库中删除时，该约束将删除给定用户的所有凭据。 同样，我们也传递了 `null: false` 以禁止在没有现有用户的情况下创建凭据。 通过使用数据库约束，我们在数据库级别强制执行数据完整性，而不是依赖于临时和容易出错的应用程序逻辑。*

接下来，让我们按照 Phoenix 的指示迁移我们的数据库：

```elixir
$ mix ecto.migrate
mix ecto.migrate
Compiling 2 files (.ex)
Generated hello app

[info]  == Running Hello.Repo.Migrations.CreateCredentials.change/0 forward

[info]  create table credentials

[info]  create index credentials_email_index

[info]  create index credentials_user_id_index

[info]  == Migrated in 0.0s
```

在我们将凭据集成到 Web 层之前，我们需要让我们的上下文知道如何关联用户和凭据。 首先，打开 `lib/hello/accounts/user.ex` 并添加以下关联：

```elixir
+ alias Hello.Accounts.Credential


  schema "users" do
    field :name, :string
    field :username, :string
+   has_one :credential, Credential

    timestamps()
  end
```

我们使用 `Ecto.Schema` 的 `has_one` 宏让 Ecto 知道如何将我们的父 User 与子 Credential 相关联。 接下来，让我们在 `accounts/credential.ex` 中添加相反方向的关系：

```elixir
+ alias Hello.Accounts.User


  schema "credentials" do
    field :email, :string
-   field :user_id, :id
+   belongs_to :user, User

    timestamps()
  end
```

我们使用 `belongs_to` 宏将我们的子关系映射到父 User。 设置好架构关联后，让我们打开 `accounts/accounts.ex` 并对生成的 `list_users` 和 `get_user!` 函数进行以下更改：

```elixir
  def list_users do
    User
    |> Repo.all()
    |> Repo.preload(:credential)
  end

  def get_user!(id) do
    User
    |> Repo.get!(id)
    |> Repo.preload(:credential)
  end
```

我们重写了 `list_users/0` 和 `get_user!/1`，我们获取用户时，就会预加载凭证关联。 Repo 预加载功能从数据库中获取一个 schema 中的关联数据，然后将其置于该 schema 中。 当对集合进行操作时，例如我们在 `list_users` 中的查询，Ecto 可以在单个查询中有效地预加载关联。 这允许我们将 `％Accounts.User{}` 结构表示为始终包含凭据，而不会让调用者担心获取额外数据。

接下来，让我们通过将凭据输入添加到我们的用户表单来向 Web 展示我们的新功能。 打开 `lib/hello_web/templates/user/form.html.eex` 并键入提交按钮上方的新凭据表单组：

```elixir
  ...
+ <div class="form-group">
+   <%= inputs_for f, :credential, fn cf -> %>
+     <%= label cf, :email %>
+     <%= text_input cf, :email %>
+     <%= error_tag cf, :email %>
+   <% end %>
+ </div>

  <%= submit "Submit" %>
```

我们使用 `Phoenix.HTML` 的 `inputs_for` 函数在父表单中添加关联嵌套字段。 在嵌套输入中，我们呈现了凭证的电子邮件字段，并包含标签和error_tag帮助器，就像我们的其他输入一样。

接下来，让我们在用户显示模板中显示用户的电子邮件地址。 将以下代码添加到 `lib/hello_web/templates/user/show.html.eex` ：

```elixir
  ...
+ <li>
+   <strong>Email:</strong>
+   <%= @user.credential.email %>
+ </li>
</ul>
```

现在，如果我们访问 `http://localhost:4000/users/new`，我们将看到新的电子邮件输入，但如果您尝试保存用户，则会发现该电子邮件字段被忽略。 没有运行验证，告诉你它是空白的，数据没有保存，最后你会得到一个异常 `(UndefinedFunctionError) function nil.email/0 is undefined or private`。 怎么回事？

我们使用 Ecto 的 `belongs_to` 和 `has_one` 关联来连接我们的数据在上下文级别的相关性，但请记住，这与我们面向 Web 的用户输入分离。 要将用户输入与我们的 schema 关联相连接，我们需要按照目前处理其他用户输入的方式处理它 - 在 changesets 中。 删除生成器添加的 Credential 的别名，并在 Accounts 上下文中修改 `alias Hello.Accounts.User`，`create_user/1` 和 `update_user/2` 函数，以构建一个知道如何使用嵌套凭据信息转换用户输入的更改集：

```elixir
- alias Hello.Accounts.User
+ alias Hello.Accounts.{User, Credential}
  ...

  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
+   |> Ecto.Changeset.cast_assoc(:credential, with: &Credential.changeset/2)
    |> Repo.update()
  end

  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
+   |> Ecto.Changeset.cast_assoc(:credential, with: &Credential.changeset/2)
    |> Repo.insert()
  end
  ...

- alias Hello.Accounts.Credential
```

我们更新了将用户变更集管道输入 `Ecto.Changeset.cast_assoc/3` 的函数。 Ecto 的 `cast_assoc/3` 允许我们告诉 changeset 如何将用户输入强制转换为 schema 关系。 我们还使用 `:with` 选项告诉 Ecto 使用我们的`Credential.changeset/2` 函数来转换数据。 这样，在保存用户变更集时，将应用我们在 `Credential.changeset/2` 中执行的任何验证。

最后，如果您访问 `http://localhost:4000/users/new` 并尝试保存空的电子邮件地址，您将看到正确的验证错误消息。 如果输入有效信息，则数据将被正确转换并保留。

```elixir
Show User
Name: Chris McCord
Username: chrismccord
Email: chris@example.com
```

现在看起来并不多，但它确实有效！ 我们在上下文中添加了与数据库强制执行的数据完整性的关系。 不错。 让我们继续建设！

## Adding Account functions

正如我们所见，您的上下文模块是暴露和组织相关功能的专用模块。 Phoenix 生成泛型函数，例如 `list_users` 和`update_user`，但它们仅作为您扩展业务逻辑和应用程序的基础。 要开始使用真实功能扩展我们的 `Accounts` 上下文，让我们解决一个明显的应用程序问题 - 我们可以在我们的系统中创建具有凭据的用户，但他们无法使用这些凭据登录。 构建完整的用户身份验证系统超出了本指南的范围，但让我们开始使用基本的电子邮件登录页面，该页面允许我们跟踪当前用户的会话。 这将让我们专注于扩展我们的 `Accounts` 上下文，同时为您提供良好的开端，从中发展出完整的身份验证解决方案。

首先，让我们想一个描述我们想要完成的功能的名称。 要通过电子邮件地址对用户进行身份验证，我们需要一种方法来查找该用户并验证其输入的凭据是否有效。 我们可以通过在 `Accounts` 上下文中公开单个函数来完成此操作。

`> user = Accounts.authenticate_by_email_password(email, password)`

那看起来不错。 一个描述我们的代码意图的描述性名称是最好的。 这个功能清楚地说明了它的用途，同时让我们的调用者不需要知道其内部细节。 对 `lib/hello/accounts/accounts.ex` 文件添加以下内容：

```elixir
def authenticate_by_email_password(email, _password) do
  query =
    from u in User,
      inner_join: c in assoc(u, :credential),
      where: c.email == ^email

  case Repo.one(query) do
    %User{} = user -> {:ok, user}
    nil -> {:error, :unauthorized}
  end
end
```

我们定义了 `authenticate_by_email_password/2` 函数，该函数现在丢弃密码字段，但是当您继续构建应用程序时，可以集成诸如 guardian 或 comeonin 之类的工具。 我们在函数中需要做的就是找到具有匹配凭据的用户，并在`:ok` 元组返回 `％Accounts.User {}` 结构或 `{:error，:unauthorized}`，以使调用者知道他们的身份验证尝试具有失败。

现在我们可以从上下文中对用户进行身份验证，让我们在 Web 层添加一个登录页面。 首先在 `lib/hello_web/controllers/session_controller.ex` 中创建一个新控制器：

```elixir
defmodule HelloWeb.SessionController do
  use HelloWeb, :controller

  alias Hello.Accounts

  def new(conn, _) do
    render(conn, "new.html")
  end

  def create(conn, %{"user" => %{"email" => email, "password" => password}}) do
    case Accounts.authenticate_by_email_password(email, password) do
      {:ok, user} ->
        conn
        |> put_flash(:info, "Welcome back!")
        |> put_session(:user_id, user.id)
        |> configure_session(renew: true)
        |> redirect(to: "/")
      {:error, :unauthorized} ->
        conn
        |> put_flash(:error, "Bad email/password combination")
        |> redirect(to: Routes.session_path(conn, :new))
    end
  end

  def delete(conn, _) do
    conn
    |> configure_session(drop: true)
    |> redirect(to: "/")
  end
end
```

我们定义了一个 SessionController 来处理登录和退出应用程序的用户。 我们的 `new` action 负责简单地呈现“new session”表单，该表单数据 post 到我们控制器的create action。 在 `create` 中，我们匹配表单字段并调用我们刚刚定义的 `Accounts.authenticate_by_email_password/2`。 如果成功，我们使用`Plug.Conn.put_session/3` 将经过身份验证的用户 ID 放入会话中，并使用成功的欢迎消息重定向到主页。 我们在重定向之前还调用了 `configure_session（conn，renew：true）` 以避免会话固定攻击。 如果身份验证失败，我们会添加一条 Flash 错误消息，并重定向到登录页面以供用户重试。 要完成控制器，我们支持删除操作，只需调用`Plug.Conn.configure_session/2` 即可删除会话并重定向到主页。

接下来，让我们在 `lib/hello_web/router.ex` 中连接我们的会话路由：

```elixir
  scope "/", HelloWeb do
    pipe_through :browser

    get "/", PageController, :index
    resources "/users", UserController
+   resources "/sessions", SessionController, only: [:new, :create, :delete],
                                              singleton: true
  end
```

我们使用资源在 `"/session"` 路径下生成一组路由。 这和其他路由所一样，除了这次我们还传递了 `:only` 选项来限制生成哪些路由，因为我们只需要支持 `:new`，`:create` 和 `:delete` actions。 我们还使用了 `singleton: true`选项，它定义了所有 RESTful 路由，但不需要在 URL 中传递资源 ID。 我们不需要 URL 中的ID，因为我们的操作始终作用于系统中的“当前”用户。 ID始终在会话中。 在我们完成路由器之前，让我们在路由器上添加一个身份验证 plug ，允许我们在用户使用新的会话控制器登录后锁定某些路由。 将以下函数添加到 `lib/hello_web/router.ex`：

```elixir
  defp authenticate_user(conn, _) do
    case get_session(conn, :user_id) do
      nil ->
        conn
        |> Phoenix.Controller.put_flash(:error, "Login required")
        |> Phoenix.Controller.redirect(to: "/")
        |> halt()
      user_id ->
        assign(conn, :current_user, Hello.Accounts.get_user!(user_id))
    end
  end
```

我们在路由器中定义了一个 `authenticate_user/2` plug，它只使用 `Plug.Conn.get_session/2` 来检查会话中的 `:user_id`。 如果我们找到一个，则表示用户之前已经过身份验证，我们调用 `Hello.Accounts.get_user/1` 将我们的 `:current_user` 放入 connection assign 中。 如果我们没有会话，我们会添加一条 flash 错误消息，重定向到主页，我们使用 `Plug.Conn.halt/1` 来阻止调用下游的其他 plug。 我们现在还不会使用这个新的 plug，但它会准备好等待，因为我们会在短时间内添加经过验证的路由。

最后，我们需要 `SessionView` 为我们的登录表单呈现模板。 在 `lib/hello_web/views/session_view.ex` 中创建一个新文件：

```elixir
defmodule HelloWeb.SessionView do
  use HelloWeb, :view
end
```

接下来，加入新的模板文件 `lib/hello_web/templates/session/new.html.eex`:

```elixir
<h1>Sign in</h1>

<%= form_for @conn, Routes.session_path(@conn, :create), [method: :post, as: :user], fn f -> %>
  <div class="form-group">
    <%= text_input f, :email, placeholder: "Email" %>
  </div>

  <div class="form-group">
    <%= password_input f, :password, placeholder: "Password" %>
  </div>

  <div class="form-group">
    <%= submit "Login" %>
  </div>
<% end %>

<%= form_for @conn, Routes.session_path(@conn, :delete), [method: :delete, as: :user], fn _ -> %>
  <div class="form-group">
    <%= submit "logout" %>
  </div>
<% end %>
```

为简单起见，我们在此模板中添加了登录和注销表单。 对于我们的登录表单，我们将 `@conn` 直接传递给 `form_for`，将表单操作指向 `session_path(@conn，:create)`。 我们还传递了 `as: :user` 选项，它告诉Phoenix 将表单参数包装在 `"user"`键中。 接下来，我们使用 `text_input` 和 `password_input` 函数发送`"email"` 和 `"password"` 参数。


对于注销，我们只是定义了一个将 `DELETE` HTTP 方法发送到服务器 delete path 的表单。 现在，如果您访问`http://localhost:4000/sessions/new` 的登录页面并输入错误的电子邮件地址，则应该会收到您的 Flash 消息。 输入有效的电子邮件地址将重定向到主页，并显示成功的 Flash 通知。


###  Cross-context dependencies

现在我们已经有了用户帐户和凭据的初始功能，让我们开始处理应用程序的其他主要功能 - 管理页面内容。 我们希望支持内容管理系统（CMS），作者可以在其中创建和编辑网站页面。 虽然我们可以扩展我们的 Accounts 上下文 来实现 CMS 功能，但如果我们退一步考虑我们应用程序的耦合性，我们就知道这样不适合。 帐户系统根本不关心 CMS 系统。 我们的帐户上下文的职责是管理用户及其凭据，而不是处理页面内容更改。 这里明确需要一个单独的上下文来处理这些责任。 我们称之为 CMS。

让我们创建一个 CMS 上下文来处理基本的 CMS 功能。 在编写代码之前，让我们假设我们有以下 CMS 功能要求：

1. 页面的创建和更新
2. 页面属于负责发布更新的作者
3. 作者信息应与页面一起显示，包括 CMS 中作者描述和角色，例如 `"editor"`，`"writer"` 或 `"intern"` 等信息。

从描述中可以清楚地看出，我们需要一个 `Page` resource 来存储页面信息。 那我们的作者信息呢？ 虽然我们可以扩展现有的 `Accounts.User` schema ，以包含 bio 和 role 等信息，但这会违反我们为上下文设置的职责。 为什么我们的帐户系统现在应该知道作者信息？ 更糟糕的是，对于像 "role" 这样的字段，系统中的 CMS 角色可能会与我们的应用程序中的其他帐户角色冲突或混淆。 还有更好的方法。

具有 "users" 的应用程序自然是用户驱动的。 毕竟，我们的软件通常设计为人类最终用户以这种或那种方式使用。 除了扩展我们的 `Accounts.User` 结构来满足我们整个平台的每个 filed 和责任，最好将这些职责与拥有该功能的模块保持一致。 在我们的示例中，我们可以创建一个 `CMS.Author` 结构，该结构包含与 `CMS` 作者相关的特有的字段。 现在我们可以在这里放置像 "role" 和 "bio" 这样的字段。 同样，我们还在我们的应用程序中获得了适合我们所在域的专用数据结构，而不是单一的 `％User{}`，需要任何地方任何人都使用。

有了我们的计划，让我们开始工作吧。 运行以下命令以生成新上下文：

```elixir
$ mix phx.gen.html CMS Page pages title:string body:text \
views:integer --web CMS

* creating lib/hello_web/controllers/cms/page_controller.ex
* creating lib/hello_web/templates/cms/page/edit.html.eex
* creating lib/hello_web/templates/cms/page/form.html.eex
* creating lib/hello_web/templates/cms/page/index.html.eex
* creating lib/hello_web/templates/cms/page/new.html.eex
* creating lib/hello_web/templates/cms/page/show.html.eex
* creating lib/hello_web/views/cms/page_view.ex
* creating test/hello_web/controllers/cms/page_controller_test.exs
* creating lib/hello/cms/page.ex
* creating priv/repo/migrations/20170629195946_create_pages.exs
* creating lib/hello/cms/cms.ex
* injecting lib/hello/cms/cms.ex
* creating test/hello/cms/cms_test.exs
* injecting test/hello/cms/cms_test.exs

Add the resource to your CMS :browser scope in lib/hello_web/router.ex:

    scope "/cms", HelloWeb.CMS, as: :cms do
      pipe_through :browser
      ...
      resources "/pages", PageController
    end


Remember to update your repository by running migrations:

$ mix ecto.migrate

```

页面上的 `views` 属性不会由用户直接更新，因此我们将其从生成的表单中删除。 打开 `lib/hello_web/templates/cms/page/form.html.eex` 并删除此部分：

```elixir
-  <%= label f, :views %>
-  <%= number_input f, :views %>
-  <%= error_tag f, :views %>
```

另外，更改 `lib/hello/cms/page.ex` 以删除 permitted params 中的 `:views`：

```elixir
  def changeset(%Page{} = page, attrs) do
    page
-    |> cast(attrs, [:title, :body, :views])
-    |> validate_required([:title, :body, :views])
+    |> cast(attrs, [:title, :body])
+    |> validate_required([:title, :body])
  end
```

最后，在 `priv/repo/migrations` 中打开新文件，以确保 `views` 属性具有默认值：

```elixir
    create table(:pages) do
      add :title, :string
      add :body, :text
-     add :views, :integer
+     add :views, :integer, default: 0

      timestamps()
    end
```

*这次我们将 `--web` 选项传递给生成器。 这告诉 Phoenix 用于 Web 模块的命名空间，例如控制器和视图。* 当您在系统中存在冲突的资源（例如我们现有的 `PageController` ）时，这非常有用，以及一种自然命名路径和不同功能（如CMS系统）的方法。 Phoenix 指示我们为路由器添加一个新的 `scope`，以获得 `"/cms"` 路径前缀。 让我们将以下内容粘贴到我们的 `lib/hello_web/router.ex` 中，但是我们将对 `pipe_through` 宏进行一次修改：

```elixir
  scope "/cms", HelloWeb.CMS, as: :cms do
    pipe_through [:browser, :authenticate_user]

    resources "/pages", PageController
  end
```

我们添加了 `:authenticate_user` 插件，要求此CMS范围内的所有路由都有登录用户。 有了我们的路由，我们可以 migrate up 数据库：

```elixir
$ mix ecto.migrate

Compiling 12 files (.ex)
Generated hello app

[info]  == Running Hello.Repo.Migrations.CreatePages.change/0 forward

[info]  create table pages

[info]  == Migrated in 0.0s
```

现在，让我们使用 `mix phx.server` 启动服务器并访问 `http://localhost:4000/cms/pages`。 如果我们尚未登录，我们将被重定向到主页，并显示一条错误消息告诉我们要登录。让我们登录`http://localhost:4000/sessions/new`，然后重新访问 `http://localhost:4000/cms/pages`。 现在我们已经过身份验证，我们应该看到一个熟悉的页面资源列表，其中包含 `New Page` 链接。

在我们创建任何页面之前，我们需要页面作者。 让我们运行 `phx.gen.context` 生成器来生成 `Author` schema 以及注入的上下文函数：

```elixir
$ mix phx.gen.context CMS Author authors bio:text role:string \
genre:string user_id:references:users:unique

* creating lib/hello/cms/author.ex
* creating priv/repo/migrations/20170629200937_create_authors.exs
* injecting lib/hello/cms/cms.ex
* injecting test/hello/cms/cms_test.exs

Remember to update your repository by running migrations:

    $ mix ecto.migrate
```

我们使用上下文生成器来注入代码，就像我们生成凭证代码时一样。 我们添加了字段，bio，他们在内容管理系统中的角色，作者写入的类型，最后是我们帐户系统中用户的外键。 由于我们的帐户上下文仍然是我们应用程序中最终用户的权限，因此我们的 CMS 作者将依赖于此。 也就是说，任何特定于作者的信息都将保留在 authors schema 中。 我们还可以使用 user account 的信息通过虚拟字段来装饰我们的 Author，并且永远不会公开 `User` 结构。 这将确保 `CMS API` 的使用者免受 `User` 上下文中的更改的影响。

在迁移数据库之前，我们需要在新生成的 `*_create_authors.exs` 迁移中再次处理数据完整性。 在 `priv/repo/migrations` 中打开新生成的文件，并对外键约束进行以下更改：

```elixir
  def change do
    create table(:authors) do
      add :bio, :text
      add :role, :string
      add :genre, :string
-     add :user_id, references(:users, on_delete: :nothing)
+     add :user_id, references(:users, on_delete: :delete_all),
+                   null: false

      timestamps()
    end

    create unique_index(:authors, [:user_id])
  end
```

我们再次使用 `:delete_all` 策略来强制执行数据完整性。 这样，当通过 `Accounts.delete_user/1` 从应用程序中删除用户时，我们不必担心依赖于 Accounts 上下文中的程序代码来清理 `CMS` author 记录。 这样可以使我们的应用程序代码从数据完整性上解耦，它们是属于数据库的。

在我们继续之前，我们有一个最终的迁移生成。 现在我们有了一个 authors 表，我们可以关联页面和作者。 让我们在  pages 表中添加一个 `author_id` 字段。 运行以下命令以生成新的迁移：

```elixir
$ mix ecto.gen.migration add_author_id_to_pages

* creating priv/repo/migrations
* creating priv/repo/migrations/20170629202117_add_author_id_to_pages.exs
```

打开 `*_add_author_id_to_pages.exs` 文件，它位于 `priv/repo/migrations` 目录下，然后输入:

```elixir
  def change do
    alter table(:pages) do
      add :author_id, references(:authors, on_delete: :delete_all),
                      null: false
    end

    create index(:pages, [:author_id])
  end
```

我们使用 `alter` 宏将新的 `author_id` 字段添加到 pages 表中，并使用外键关联 `authors` 表。 当从应用程序中删除父作者时，我们还使用 `on_delete: :delete_all` 选项删除其所有页面。

现在执行迁移：

```elixir
$ mix ecto.migrate

[info]  == Running Hello.Repo.Migrations.CreateAuthors.change/0 forward

[info]  create table authors

[info]  create index authors_user_id_index

[info]  == Migrated in 0.0s

[info]  == Running Hello.Repo.Migrations.AddAuthorIdToPages.change/0 forward

[info]  == Migrated in 0.0s
```

准备好我们的数据库后，让我们在 CMS 系统中集成作者和页面。

### Cross-context data

软件中的依赖关系通常是不可避免的，但我们可以尽可能地限制它们，并在需要依赖时减轻维护负担。 到目前为止，我们已经做了很好的工作，将我们的应用程序的两个主要上下文相互隔离，但现在我们有一个必要的依赖来处理。

我们的 `Author` resource 用于保持在 CMS 内代表作者的职责，但最终要使作者完全存在，必须存在由`Accounts.User` 表示的最终用户。 鉴于此，我们的 `CMS` 上下文将具有对 `Accounts`上下文的数据依赖性。 考虑到这一点，我们有两种选择。 一种是在 `Accounts` 上下文中公开 API ，这些 API 允许我们有效地获取用于 CMS 系统的用户数据，或者我们可以使用数据库连接来获取相关数据。 根据您的权衡和应用程序大小，两者都是有效的选项，但是当您具有硬数据依赖性时，从数据库加入数据对于大类应用程序来说就很好。 如果您决定以后会将耦合的上下文分解为完全独立的应用程序和数据库，您仍然可以获得隔离的好处。 这是因为您的公共上下文 API 有可能仍然保持不变。

现在我们知道了数据依赖关系的存在，让我们添加我们的 schema 关联，这样我们就可以将页面与作者和作者联系起来。 对 `lib/hello/cms/page.ex` 进行以下更改：

```elixir

+ alias Hello.CMS.Author


  schema "pages" do
    field :body, :string
    field :title, :string
    field :views, :integer
+   belongs_to :author, Author

    timestamps()
  end
```

我们在页面和作者之间添加了 `:belongs_to` 关系。 接下来，让我们在 `lib/hello/cms/author.ex` 中添加另一个方向的关联：

```elixir
+ alias Hello.CMS.Page


  schema "authors" do
    field :bio, :string
    field :genre, :string
    field :role, :string

-   field :user_id, :id
+   has_many :pages, Page
+   belongs_to :user, Hello.Accounts.User

    timestamps()
  end
```

我们为作者页面添加了 `has_many` 关联，然后通过使用 `belongs_to` 关联到 `Accounts.User` schema 来引入我们对Accounts上下文的数据依赖性。

有了我们的关联，让我们更新我们的 `CMS` 上下文，以在创建或更新页面时依赖一个作者。 我们将从数据获取更改开始。 在 `lib/hello/cms/cms.ex` 中打开 CMS 上下文，并使用以下定义替换 `list_pages/0` ，`get_page/1` 和`get_author/1` 函数：

```elixir
alias Hello.CMS.{Page, Author}
  alias Hello.Accounts

  def list_pages do
    Page
    |> Repo.all()
    |> Repo.preload(author: [user: :credential])
  end

  def get_page!(id) do
    Page
    |> Repo.get!(id)
    |> Repo.preload(author: [user: :credential])
  end

  def get_author!(id) do
    Author
    |> Repo.get!(id)
    |> Repo.preload(user: :credential)
  end
```

我们首先重写了 `list_pages/0` 函数，以从数据库中预加载关联的作者，用户和凭据数据。 接下来，我们重写了 `get_page/1` 和 `get_author/1` 来预加载必要的数据。

有了我们的数据访问功能，让我们将注意力转向持久化。 我们可以在获取页面时获取作者，但是在创建或编辑页面时我们还没有允许作者被持久化。 我们来解决这个问题。 打开 `lib/hello/cms/cms.ex` 并进行以下更改：

```elixir
def create_page(%Author{} = author, attrs \\ %{}) do
  %Page{}
  |> Page.changeset(attrs)
  |> Ecto.Changeset.put_change(:author_id, author.id)
  |> Repo.insert()
end

def ensure_author_exists(%Accounts.User{} = user) do
  %Author{user_id: user.id}
  |> Ecto.Changeset.change()
  |> Ecto.Changeset.unique_constraint(:user_id)
  |> Repo.insert()
  |> handle_existing_author()
end
defp handle_existing_author({:ok, author}), do: author
defp handle_existing_author({:error, changeset}) do
  Repo.get_by!(Author, user_id: changeset.data.user_id)
end
```

这里有很多代码，所以让我们分解一下。 首先，我们重写了 `create_page` 函数以要求一个 `CMS.Author` 结构，它代表发布帖子的作者。 然后，我们将变换集传递给 `Ecto.Changeset.put_change/2`，以将 `author_id` 关联放在变更集中。 接下来，我们使用 `Repo.insert` 将新页面插入到数据库中，其中包含我们关联的 `author_id`。

我们的 CMS 系统要求任何用户在发布帖子之前必须要存在作者，因此我们添加了 `ensure_author_exists` 函数以编程方式允许创建作者。我们的新函数接受 `Accounts.User` 结构，并使用该 `user.id` 查找应用程序中的现有作者，或者为该用户创建新作者。我们的 authors 表对 `user_id` 外键有一个唯一性约束，可以防止竞争条件下允许重复的作者。也就是说，我们仍然需要防止免于竞争另一个用户的插入。为实现此目的，我们使用一个专门构建的变更集与 `Ecto.Changeset.change/1`，它接受一个带有 `user_id` 的新 `Author` 结构。变更集的唯一目的是将唯一约束c冲突转换为我们可以处理的错误。在尝试使用 `Repo.insert/1` 插入新作者之后，我们将管道传递给`handle_existing_author/1`，它匹配成功和错误情况。对于成功案例，我们完成并简单地返回创建的作者，否则我们使用 `Repo.get_by!` 获取已存在的 `user_id的` 作者。

这包含了我们的 CMS 变化。 现在，让我们更新我们的 Web 层以支持我们的刚刚添加的东西。 在我们更新各个CMS控制器 actions 之前，我们需要对 `CMS.PageController` plug 管道进行一些补充。 首先，我们必须确保最终用户访问CMS时存在作者，我们需要授权访问页面所有者。

打开生成的 `lib/hello_web/controllers/cms/page_controller.ex` 并进行以下添加：

```elixir
  plug :require_existing_author
  plug :authorize_page when action in [:edit, :update, :delete]

  ...

  defp require_existing_author(conn, _) do
    author = CMS.ensure_author_exists(conn.assigns.current_user)
    assign(conn, :current_author, author)
  end

  defp authorize_page(conn, _) do
    page = CMS.get_page!(conn.params["id"])

    if conn.assigns.current_author.id == page.author_id do
      assign(conn, :page, page)
    else
      conn
      |> put_flash(:error, "You can't modify that page")
      |> redirect(to: Routes.cms_page_path(conn, :index))
      |> halt()
    end
  end
```

我们在 `CMS.PageController` 中添加了两个新 plug。 第一个 plug `:require_existing_author`，用于此控制器中的每个操作。 `require_existing_author/2` plug 调用我们的 `CMS.ensure_author_exists/1` 并从连接 assign 传入 `current_user`。 在找到或创建作者之后，我们使用 `Plug.Conn.assign/3` 将 `:current_author` key 放入 assigns 以供下游使用。

接下来，我们添加了一个 `:authorize_page` plug，该 plug 利用了 plug 的保护子句功能，我们可以将插件限制为仅限某些 actions 。 我们的 `authorize_page/2` plug 的定义首先从连接参数中获取页面，然后对`current_author` 进行授权检查。 如果我们当前作者的 ID 与获取的页面 ID 匹配，我们已经验证页面的所有者正在访问该页面，我们将 `page` 传入 connection assigns 给要在控制器中其他 actions 使用。 如果我们的授权失败，我们添加一条 flash 错误消息，重定向到页面 index 页面，然后调用 `Plug.Conn.halt/1` 以防止 plug 管道继续执行并调用控制器 action。

我们的新 plug 准备好之后，我们现在可以修改我们的 `create`, `edit`, `update`, 和 `delete` ，以利用 connection assign 中的新值：

```elixir
- def edit(conn, %{"id" => id}) do
+ def edit(conn, _) do
-   page = CMS.get_page!(id)
-   changeset = CMS.change_page(page)
+   changeset = CMS.change_page(conn.assigns.page)
-   render(conn, "edit.html", page: page, changeset: changeset)
+   render(conn, "edit.html", changeset: changeset)
  end

  def create(conn, %{"page" => page_params}) do
-   case CMS.create_page(page_params) do
+   case CMS.create_page(conn.assigns.current_author, page_params) do
      {:ok, page} ->
        conn
        |> put_flash(:info, "Page created successfully.")
        |> redirect(to: Routes.cms_page_path(conn, :show, page))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

- def update(conn, %{"id" => id, "page" => page_params}) do
+ def update(conn, %{"page" => page_params}) do
-   page = CMS.get_page!(id)
-   case CMS.update_page(page, page_params) do
+   case CMS.update_page(conn.assigns.page, page_params) do
      {:ok, page} ->
        conn
        |> put_flash(:info, "Page updated successfully.")
        |> redirect(to: Routes.cms_page_path(conn, :show, page))
      {:error, %Ecto.Changeset{} = changeset} ->
-       render(conn, "edit.html", page: page, changeset: changeset)
+       render(conn, "edit.html", changeset: changeset)
    end
  end

- def delete(conn, %{"id" => id}) do
+ def delete(conn, _) do
-   page = CMS.get_page!(id)
-   {:ok, _page} = CMS.delete_page(page)
+   {:ok, _page} = CMS.delete_page(conn.assigns.page)

    conn
    |> put_flash(:info, "Page deleted successfully.")
    |> redirect(to: Routes.cms_page_path(conn, :index))
  end
```

我们修改了 `create` action来从 connection assign 中获取 `current_author`，这是由我们的`require_existing_author` plug 放置的。 然后，我们将当前作者传递到 `CMS.create_page`，在那里它将用于将作者与新页面相关联。 接下来，我们更改了 `update` action 以将 `conn.assigns.page` 传递到`CMS.update_page/2`，而不是直接在 action 中获取它。 由于我们的 `authorize_page` plug 已经获取了页面并将其放入了 assigns 中，因此我们可以在操作中直接引用它。 同样，我们更新了 `delete` action 以将 `conn.assigns.page` 传递到 CMS，而不是在 action 中获取页面。

要完成 Web 更改，让我们在显示页面时显示作者。 首先，打开 `lib/hello_web/views/cms/page_view.ex` 并添加一个辅助函数来处理作者姓名的格式：

```elixir
defmodule HelloWeb.CMS.PageView do
  use HelloWeb, :view

  alias Hello.CMS

  def author_name(%CMS.Page{author: author}) do
    author.user.name
  end
end
```

接下来，让我们打开 `lib/hello_web/templates/cms/page/show.html.eex` 并使用我们的新函数：

```elixir
+ <li>
+   <strong>Author:</strong>
+   <%= author_name(@page) %>
+ </li>
</ul>
```

现在，使用 `mix phx.server` 启动服务器并试用它。 访问 `http://localhost:4000/cms/pages/new` 并保存新页面。

```elixir
Page created successfully.

Show Page Title: Home
Body: Welcome to Phoenix!
Views: 0
Author: Chris
```

正常运行！ 我们现在有两个独立的上下文负责用户帐户和内容管理。 我们在必要时将内容管理系统与帐户相结合，同时尽可能地保持每个系统的隔离。 这为我们开发应用程序提供了一个很好的基础。


### Adding CMS functions

就像我们使用新的特定于应用程序的函数（如 `Accounts.authenticate_by_email_password/2`）扩展 `Accounts` 上下文一样，让我们扩展我们生成的 `CMS` 上下文来添加新功能。 对于任何 CMS 系统，跟踪页面被查看次数的功能对于受欢迎程度排名至关重要。 虽然我们可以尝试使用现有的 `CMS.update_page` 函数，沿着`CMS.update_page(user, page, %{views: page.views + 1})`，但这不仅会出现竞争条件，而且会还要求调用者了解我们的 CMS 系统。 为了了解竞争条件存在的原因，让我们来看看事件的可能执行情况：

直觉上，您会假设以下事件：

1. 用户1加载页面 count 为13
2. 用户1加载页面 count 为14
3. 用户2加载页面 count 为14
4. 用户2加载页面 count 为15

现实中有可能是:

1. 用户1加载页面 count 为13
2. 用户2加载页面 count 为13
3. 用户1加载页面 count 为14
4. 用户2加载页面 count 为14

由于多个调用者可能同时更新过期视图值，因此竞争条件将使这成为更新现有表的不可靠方式。 有更好的方法。

再次，让我们想一个描述我们想要完成的功能的名称。

`page = CMS.inc_page_views(page)`

那看起来很棒。 我们的调用者不会对这个函数的作用产生混淆，我们可以在原子操作中包含增量以防止竞争条件。

打开CMS上下文（`lib/hello/cms/cms.ex`），并添加以下新功能：

```elixir
def inc_page_views(%Page{} = page) do
  {1, [%Page{views: views}]} =
    Repo.update_all(
      from(p in Page, where: p.id == ^page.id),
      [inc: [views: 1]], returning: [:views])

  put_in(page.views, views)
end
```

我们构建了一个查询，用于根据 ID 获取当前页面, 我们将其传递给 `Repo.update_all`。 Ecto 的`Repo.update_all` 允许我们对数据库执行批量更新，非常适合原子更新值，例如增加视图计数。 repo 操作的结果返回更新记录的数量，以及 `:returning` 选项指定的 schema 值。 当我们收到新的页面浏览量时，我们使用 `put_in(page.views, views)` 将新的视图计数放在页面中。

有了我们的上下文功能，让我们在 CMS 页面控制器中使用它。 更新 `lib/hello_web/controllers/cms/page_controller.ex` 中的 show action 以调用我们的新函数：

```elixir
def show(conn, %{"id" => id}) do
  page =
    id
    |> CMS.get_page!()
    |> CMS.inc_page_views()

  render(conn, "show.html", page: page)
end
```

我们修改了 `show` action 以将我们获取的页面管道输入 `CMS.inc_page_views/1`，这将返回更新的页面。 然后我们像以前一样渲染我们的模板。 我们来试试吧。 刷新您的一个页面几次，并观看视图数增加。

我们还可以在ecto调试日志中看到我们的原子更新：

```elixir
[debug] QUERY OK source="pages" db=3.1ms
UPDATE "pages" AS p0 SET "views" = p0."views" + $1 WHERE (p0."id" = $2)
RETURNING p0."views" [1, 3]
```

干得好！

正如我们所见，使用上下文进行设计为您的应用程序增长奠定了坚实的基础。 使用离散的，定义良好的 API 来暴露系统的目标功能，将让您开发出可重用的代码和更易于维护的应用程序。


### 完结！

不容易啊，翻译这样一篇文章，每天花几个小时，从 2018 年翻译到了2019年，恩，现在是北京时间 2019.01.02 00:31:10 。
翻译不是目的，翻译只是让我认真的阅读。
因为现在还没法百分之百直接看懂英文文档，大概只能看懂 80% 左右吧，剩下的 20% 得去找 Google 翻译了。
如果不做翻译，有时候碰到似懂非懂的语句就直接过了，可能就漏掉了重要的信息，或者真实意思可能和我理解的完全相反。
为了避免这种，干脆全文翻译，这对英文技术文档的第一遍学习很有帮助，不会理解错误，不会漏掉知识点，之后再翻文档就很轻松了。
当然只适合英文水平还不是很好的现在，将来水平提高了，一把梭！
一把梭！！！
