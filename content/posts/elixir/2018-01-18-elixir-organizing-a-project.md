---
title: "elixir organizing a project"
date: 2018-01-18 22:56:26 +0800 
tags: ["elixir"]
---

## Organizing a Project

来看看真实的项目会接触到的东西。

### The Project: Fetch Issues from GitHub

github 提供了获取 issue 的 API，
`https://api.github.com/repos/user/project/issues`

返回一个 JSON 的 list。我们来重新格式化它，然后取出历史最后几项，放到一个表中。

| #     | created_at | title |
| ----- | ---------  |  ---- |
| 889 | 2013-03-16T22:03:13Z | MIX_PATH environment variable (of sorts) |
| 892 | 2013-03-20T19:22:07Z | Enhanced mix test --cover | 
| 893 | 2013-03-21T06:23:00Z | mix test time reports |
| 898 | 2013-03-23T19:19:08Z | Add mix compile --warnings-as-errors |


#### How Our Code Will Do It

程序会运行在命令行。需要传入一个 github 的账号，项目名等。所以需要一些基本的命令行参数解析。
需要通过 HTTP 访问 Github，所以我们需要一个能发送请求的 http 客户端。请求返回结果是 JSON 格式的，所以需要一个处理 JSON 的库。
所以简单的流程可以概括为：解析命令行参数，发送请求，解析返回结果，排序，筛选数据，格式化数据，放入表格。


### Task: Use Mix to Create Our New Project

Mix 为管理 Elixir 项目的命令行工具。可以使用它来创建项目，管理项目依赖，执行测试，运行代码等。
如果你已经安装了 Elixir，mix 也就随 Elixir 一起安装了。
查看帮助： `$ mix help`
你会看到 mix 的各种命令，比如`archive,new,run,test...`等等等等。
当然你还可以创建自己的命令。

#### Create the Project Tree

创建项目，名为 issues。
`$ mix new issues`
`$ cd issues`

这里又几个重要的文件和目录

- config/ 顾名思义，整个应用的配置
- lib/  我们写代码的地方
- mix.exs 项目的配置选项


### Transformation: Parse the Command Line

一般我们都会把命令行参数解析这类工作单独出来成一个模块，按照 Elixir 中的约定，模块一般命名为 'Project.CLI'，所以这里为 'Issues.CLI' 。模块的入口一般是 run 函数。
按照约定，代码放在 lib 目录，在 lib 目录下创建一个和项目名相同的子目录（这里是 lib/issues/）。这个目录放项目源码，一个文件一个模块。
我们的 `Issues.CLI` 模块对应的文件就是，issues目录下的`cli.ex`文件。

所以现在的文件结构应该是：

```
lib
|____issues
|    |_____cli.ex
|____issues.ex
```

Elixir 接收命令行参数，第一个参数为 keyword list，存储选项，第二个参数为一个 list，保存剩下的参数。

```elixir
#issues/lib/issues/cli.ex

defmodule Issues.CLI do
  @default_count 4
  @moduledoc """
    Handle the command line parsing and the dispatch to
    the various functions that end up generating a 
    table of the last _n_ issues in a github project
  """

  def run(argv) do
    parse_args(argv)
  end

  @doc """
    `argv` can be -h or --help, which returns :help.
    Otherwise it is a github user name, project name, and (optionally)
    the number of entries to format.
    Return a tuple of `{ user, project, count }`, or `:help` if help was given.
  """
  def parse_args(argv) do
    parse = OptionParser.parse(argv, switches: [ help: :boolean], aliases: [h: :help])
    case parse do
      { [ help: true ], _, _ }
        -> :help
      { _, [ user, project, count ], _ }
        -> { user, project, count }
      { _, [ user, project ], _ }
        -> { user, project, @default_count }
      _ -> :help
    end
  end
end
```

### Step: Write Some Basic Tests

没写测试总是心里没底。好在 Elixir 有个非常帮的测试框架 ExUnit。

```elixir
# issues/test/issues_test.exs
defmodule IssuesTest do
  use ExUnit.Case
    doctest Issues
    test "the truth" do
      assert 1 + 1 == 2
    end
  end
end
```

上面就是测试的一般写法。

来写写 CLI 模块的测试：

```elixir
# /issues/test/cli_test.exs

defmodule CliTest do
  use ExUnit.Case
  doctest Issues

  import Issues.CLI, only: [parse_args: 1]

  test ":help returned by option parsing with -h and --help options" do 
    assert parse_args(["-h", "anything"]) == :help
    assert parse_args(["--help", "anything"]) == :help
  end

  test "three values returned if three given" do
    assert parse_args(["user", "project", "99"]) == { "user", "project", 99 }
  end

  test "count is defaulted if two values given" do
    assert parse_args(["user", "project"]) == { "user", "project", 4 }
  end
end
```

这里的测试都使用了 ExUnit 提供的宏 assert。理解起来简单，如果断言失败，就会打印详细的错误信息。
`$ mix test` 就可以跑测试了。

假装已经跑了，从错误信息中可以看到有个地方出错了，我们改下程序就好了，具体哪错了，自己去试下就知道了啊。

```elixir
def parse_args(argv) do
  parse = OptionParser.parse(argv, switches: [ help: :boolean], aliases: [ h: :help ])
  case parse do
    { [ help: true ], _, _ } -> :help
    { _, [ user, project, count ], _ } -> { user, project,
    { _, [ user, project ], _
  end
end
```

### Transformation: Fetch from GitHub

继续，可以解析参数了，我们需要用这些信息来获取 GitHub 的数据。
我们来扩展 run 函数，加入 process 函数来处理得到的参数：`process(parse_args(argv))`
不过这有点不那么 elixir，

```elixir
# lib/issues/cli.ex

def run(argv) do
  argv
  |> parse_args
  |> process
end
```

我们需要两个 process 函数的变种，一个用来处理 `:help` 参数，另一个用来处理 用户的 github 信息。

```elixir
# lib/issues/cli.ex

def process(:help) do
  IO.puts """
    usage: issues <user> <project> [ count | #{@default_count} ]
  """
  System.halt(0)
end

def process({user, project, _count}) do 
  Issues.GithubIssues.fetch(user, project)
end
```

可以在命令行直接执行我们的函数
`$ mix run -e 'Issues.CLI.run(["-h"])'`

### Task; Use Libraries

Elixir 中有很多内库，有 Elixir 写的，也有 Erlang 写的。
欢迎到官网的文档中查看。


#### Finding an External Library

Elixir 有 hex。第三方包管理器。

可以在这上面找 [https://hex.pm/](https://hex.pm/)你想要的包，找不到的话使用 Google 和 Github 吧。

这里我们需要一个 http client，没有 Elixir 内置的，所以我们用第三方的，就你了 HTTPoison。

#### Adding a Library to Your Project

用过 npm 和 gem 的都知道咋添加依赖，Elixir 类似。
Elixir 中的依赖配置文件就是`mix.exs`

```elixir
# mix.exs

defp deps do
  [ 
    {:httpoison, "~> 0.9" }
  ]
end
```

使用 `$ mix deps` 查看依赖
使用 `$ mix deps.get` 下载依赖包

#### Back to the Transformation

回到我们的问题。我们需要写一个函数 `GithubIssues.fetch`，根据参数获取我们需要的 issues。

```elixir
# lib/issues/github_issues.ex

defmodule Issues.GithubIssues do
  @user_agent [ {"User-agent", "Elixir dave@pragprog.com}]

  def fetch(user, project) do
    issues_url(user, project)
    |> HTTPoison.get(@user_agent)
    |> handle_response
  end

  def issues_url(user, project) do
    "https://api.github.com/repos/#{user}/#{project}/issues"
  end

  def handle_response({ :ok, %{status_code: 200, body: body}}) do
    { :ok, body }
  end
  def handle_response({ _, %{status_code: _, body: body}}) do
    { :error, body }
  end
end
```

在 HTTPoison 的文档里，得先执行 `HTTPoison.start`，那是因为它是单独运行，而在我们的程序中不必如此。

我们可以在 `mix.exs` 中配置它，让它自动启动:

```elixir
# mix.exs
def application do
  [extra_applications: [:logger, :httpoison]]
end
```

简单介绍下 OTP 框架，OTP 用来管理整套运行的程序。application 函数配置配套程序的内容。
默认只有 Elixir 的 logger，我们可以添加我们自己的，这里我们加入了 httpoison。

我们可以在命令行跑这段程序了。
`$ iex -S mix` 
`iex> Issues.GithubIssues.fetch("elixir-lang", "elixir")`

然后就可以看到请求的响应。


### Transformation: Convert Response
我们还需要一个解析 JSON 的库。
继续去 `hex.pm` 搜，这个 poison 不错，加入依赖。

```elixir
# mix.exs
defp deps do 
  [
    httpoison: "~> 0.9",
    poison:    "~> 2.2"
  ]
end
```

执行 `mix deps.get`，就安装了 poison 了。

然后开始写转化响应结果的代码：

```elixir
# project/3/issues/lib/issues/github_issues.ex

def handle_response({:ok, %{status_code: 200, body: body}}) do 
  { :ok, Poison.Parser.parse!(body) }
end

def handle_response({_, %{status_code: _, body: body}}) do
  { :error, Poison.Parser.parse!(body) }
end
```

我们得处理下 fetch 可能出现的异常，回到 CLI 模块，写解析响应的函数。

```elixir
# cli.ex

def process({user, project, _count}) do
  Issues.GithubIssues.fetch(user, project)
  |> decode_response
end

def decode_response({:ok, body}), do: body
def decode_response({:error, error}) do
  {_, message} = List.keyfind(error, "message", 0)
  IO.puts "Error fetching from Github: #{message}"
  System.halt(2)
end
```


#### Application Configuration

我们的 `issues_url` 是硬编码的，这个不太符合软件工程学。
最好是做成可配置的。

文件 `config/config.exs` 就是用来做这方面的配置。

加入
`config :issues, github_url: "https://api.github.com"`

一个 config 行可以添加 一个 或 多个 键值对，这是 environment 相关的。

在代码中获取配置值：

```elixir
# lib/issues/github_issues.ex
@github_url Application.get_env(:issues, :github_url)

def issues_url(user, project) do
  "#{@github_url}/repos/#{user}/#{project}/issues"
end
```

environment 在 Erlang 代码中广泛存在。ruby 也是。
如果想根据应用的环境来做不同的配置，方法一 使用 `import_config` 

`import_config "#{Mix.env}"`

这样就可以根据环境来读取配置文件，比如 `dev.exs, test.exs, prod.exs`等。


### Transformation: Sort Data

下面，我们要对获取的数据按 `created_at` 来排序。排序可以使用 Elixir 中的 `sort/2`方法。
可以单独一个模块，不过这里偷个懒，直接写在 CLI 模块吧。

```elixir
def process({user, project, count}) do
  Issues.GithubIssues.fetch(user, project)
  |> decode_response
  |> sort_into_ascending_order
end

def sort_into_ascending_order(list_of_issues) do
  Enum.sort list_of_issues, fn i1, i2 -> Map.get(i1, "created_at") <= Map.get(i2, "created_at") end
end
```

写个测试：

```elixir
# cli_test.exs
test "sort ascending orders the correct way" do
  result = sort_into_ascending_order(fake_created_at_list(["c", "a", "b"])) 
  issues = for issue <- result, do: Map.get(issue, "created_at")
  assert issues == ~w{a b c}
end
defp fake_created_at_list(values) do
  for value <- values,
  do: %{"created_at" => value, "other_data" => "xxx"}
end
```

记得在测试文件中 引入要测试的方法 `import Issues.CLI, only: [ parse_args: 1, sort_into_ascending_order: 1 ]`

运行： `$ mix test`

### Transformation: Take First n Items

然后选取我们指定数量的记录：

```elixir
def process({user, project, count}) do 
  Issues.GithubIssues.fetch(user, project) 
  |> decode_response
  |> sort_into_ascending_order
  |> Enum.take(count)
end
```

### Transformation: Format the Table

最后要放入表中：

```elixir
def process({user, project, count}) do 
  Issues.GithubIssues.fetch(user, project)
  |> decode_response
  |> sort_into_ascending_order
  |> Enum.take(count)
  |> print_table_for_columns(["number", "created_at", "title"])
end
```

需要给 `print_table_for_columns` 传入列名。

```elixir
# table_formatter.ex

defmodule Issues.TableFormatter do
  import Enum, only: [each: 2, map: 2, map_join: 3, max: 1]
  
  def print_table_for_columns(rows, headers) do
    with data_by_columns = split_into_columns(rows, headers),
         column_widths = widths_of(data_by_columns),
         format = format_for(column_widths)
    do
        puts_one_line_in_columns(headers, format)
        IO.puts(separator(column_widths))
        puts_in_columns(data_by_columns, format)
    end
  end

  def split_into_columns(rows, headers) do
    for header <- headers do
      for row <- rows, do: printable(row[header])
    end
  end
  def printable(str) when is_binary(str), do: str
  def printable(str), do: to_string(str)

  def widths_of(columns) do
    for column <- columns, do: column |> map(&String.length/1) |> max
  end

  def format_for(column_widths) do
    map_join(column_widths, " | ", fn width -> "~-#{width}s" end) <> "~n"
  end

  def separator(column_widths) do
    map_join(column_widths, "-+-", fn width -> List.duplicate("-", width) end)
  end

  def puts_in_columns(data_by_columns, format) do 
    data_by_columns
    |> List.zip
    |> map(&Tuple.to_list/1)
    |> each(&puts_one_line_in_columns(&1, format))
  end

  def puts_one_line_in_columns(fields, format) do 
    :io.format(format, fields)
  end
end
```

这个测试要花点时间写，按住不表。
在 `cli.ex` 中引入这个函数
`import Issues.TableFormatter, only: [ print_table_for_columns: 2 ]`

### Task: Make a Command-Line Executable

直接使用 `mix run` 不太友好，我们来让它可以在命令行中跑。

Mix 可以将我们的代码各种依赖打包为一个文件，可以在各种任何 类 Unix 平台运行。
使用 Erlang 的 escript 工具，可以运行已经编译的zip打包的程序。

escript 运行程序的时候，会先找 `mix.exs` 文件中的 escript 选项。
这个选项需要返回一个关键字列表，包含 escript 的配置信息。最主要的一个配置是 `main_module`，指向有 main 方法的那个模块。
命令行参数也会传递到这个函数，类型为字符列表。

```elixir
def project do
  [
    ...
    escript: escript_config
    ...
  ]
end

defp escript_config do
  [ main_module: Issues.CLI ]  
end
```

还需要一个 main 方法，把 之前的 run 方法直接改名为 main 即可。

然后打包：`$ mix escript.build`

然后就可以在有 Erlang 的环境中运行，`$ ./issues elixir-lang elixir 3`

...

### Task: Add Some Logging

想象一下，如果一个 Elixir 应用很大，数不清的进程运行在数不清的节点上。要怎么才能知道那些重要的事件是否正常？打印日志。
在 `mix.exs` 中，已经默认开启了 logger 功能。
logger 支持4个层级的消息，`debug, info, warn, and error`。

你有两种设置日志级别的方式，第一，在编译期设置最小日志级别。需要在 `config/config.exs` 中设置：

```elixir
use Mix.config
config :issues, github_url: "https://api.github.com"
config :logger, compile_time_purge_level: :info
```

二，在运行时调用 `Logger.configure` 来改变最小日志级别。当然，这种方式不能超出配置定义的最小级别。

然后可以在程序中加入日志信息了。

基本的日志方法是 `Logger.debug, .info, .warn, .error`，函数参数为一个字符串或者一个无参的函数。

`Logger.debug "Order total #{total(order)}"`
`Logger.debug fn -> "Order total #{total(order)}" end`

来看看 加入了 logger 的 fetch 函数：

```elixir
defmodule Issues.GithubIssues do
  require Logger
  @user_agent [ {"User-agent", "Elixir dave@pragprog.com"} ]

  def fetch(user, project) do
    Logger.info "Fetching user #{user}'s project #{project}" issues_url(user, project)
    |> HTTPoison.get(@user_agent)
    |> handle_response
  end

  def handle_response({:ok, %{status_code: 200, body: body}}) do 
    Logger.info "Successful response"
    Logger.debug fn -> inspect(body) end
    { :ok, Poison.Parser.parse!(body) }
  end

  def handle_response({_, %{status_code: status, body: body}}) do 
    Logger.error "Error #{status} returned"
    { :error, Poison.Parser.parse!(body) }
  end

  @github_url Application.get_env(:issues, :github_url)
  def issues_url(user, project) do 
    "#{@github_url}/repos/#{user}/#{project}/issues"
  end

end

```

注意，`require Logger` 是必须的，不然报错。


### Task: Create Project Documentation

使用 ExDoc 来写文档，首先在 `mix.exs` 中加入依赖，然后你需要一个设置输出格式，这里使用 earmark，一个 markdown 转 html 的转换器。

```elixir
defp deps do
  [
    ...,
    {:ex_doc, "~> 0.12"},
    {:earmark, "~> 1.0", override: true}
  ]
end
```

在 `mix.exs` 你可以设置 project 的名字和远程仓库的地址。设置好后 ExDoc 会生成真实的文档链接。

```elixir
def project do
  [
    ...,
    name: "Issues",
    source_url: "https://github.com/pragdave/issues",
    ...
  ]
end 
```

然后运行 `mix deps.get`

然后生成 doc，
执行命令`$ mix docs`

然后就可以在浏览器中打开 `docs/index.html` 查看文档了。

### Coding by Transforming Data

这章展示用 Elixir 来开发程序的一个过程常用的工具等等。
最重要的是，Elixir 开发的乐趣，以及函数式编程数据转变的方式。
