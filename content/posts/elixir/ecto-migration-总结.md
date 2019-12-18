---
title: Ecto Migration 用法总结
date: 2019-06-27 11:11:11
tags: Phoenix
---

## 常用命令

1. mix ecto.gen.migration

```bash
mix ecto.gen.migration add_posts_table
```

2. mix ecto.migrate
   执行 migration

3. mix ecto.rollback

```bash
mix ecto.rollback -n 2
```

4. mix ecto.dump
   导出表结构

## 数据类型

与 PostgreSQL 搭配的常用类型：

- integer
- string
- map 对应 pg 的 jsonb
- text
- float
- json

## migration 写法

主要是在 3 个函数中工作: up, down, change
down 是 rollback 时候执行的，change 同时兼具 up 和 down 的作用。

来看看官网例子就明白了：

```elixir
defmodule MyRepo.Migrations.AddWeatherTable do
  use Ecto.Migration

  def up do
    create table("weather") do
      add :city,    :string, size: 40
      add :temp_lo, :integer
      add :temp_hi, :integer
      add :prcp,    :float

      timestamps()
    end
  end

  def down do
    drop table("weather")
  end
end
```

等同于：

```elixir
defmodule MyRepo.Migrations.AddWeatherTable do
  use Ecto.Migration

  def change do
    create table("weather") do
      add :city,    :string, size: 40
      add :temp_lo, :integer
      add :temp_hi, :integer
      add :prcp,    :float

      timestamps()
    end
  end
end
```

修改操作：

```elixir
defmodule Picea.Repo.Migrations.UpdateSheetsTable do
  use Ecto.Migration

  def change do
    alter table(:sheets) do
      add :data_type, :string, default: "sheet"
    end
  end
end
```

其他操作：

```elixir
rename table(:posts), :title, to: :summary
rename table(:posts), to: table(:new_posts)

drop table(:documents)
drop_if_exists table(:documents)

table(:documents)
table(:weather, prefix: :north_america)
```

索引：

```
create index(:posts, [:slug], concurrently: true)
create unique_index(:posts, [:slug])
drop index(:posts, [:name])
```

暂时完
