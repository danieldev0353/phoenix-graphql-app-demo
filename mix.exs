defmodule Yummy.Mixfile do
  use Mix.Project

  def project do
    [
      app: :yummy,
      version: "0.0.1",
      elixir: "~> 1.6.5",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix, :gettext] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Yummy.Application, []},
      extra_applications: [:logger, :runtime_tools, :absinthe, :absinthe_plug]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      # Framework
      {:phoenix, "~> 1.3.3"},
      {:phoenix_pubsub, "~> 1.0"},
      {:phoenix_ecto, "~> 3.2"},
      {:phoenix_html, "~> 2.10"},
      {:cowboy, "~> 1.1.2"},
      {:postgrex, "~> 0.13"},

      # Plugs
      {:cors_plug, "~> 1.5.2"},

      # GraphQL
      {:absinthe, "~> 1.4.12", override: true},
      {:absinthe_plug, "~> 1.4.4"},
      {:absinthe_phoenix, "~> 1.4.2"},
      {:dataloader, "~> 1.0.1"},
      {:kronky, "~> 0.5.0"},

      # Utils
      {:bcrypt_elixir, "~> 1.0.7"},
      {:comeonin, "~> 4.1.1"},
      {:gettext, "~> 0.15.0"},
      {:poison, "~> 3.1.0"},
      {:hackney, "~> 1.12.1", override: true},
      {:secure_random, "~> 0.5"},
      {:sweet_xml, "~> 0.6"},
      {:timex, "~> 3.1"},

      # Mails
      {:bamboo, github: "thoughtbot/bamboo"},

      # Upload
      {:arc, "~> 0.8.0"},
      {:arc_ecto, "~> 0.8.0"},
      {:ex_aws, "~> 1.1.3"},

      # Errors
      {:rollbax, "~> 0.8.2"},

      # Dev
      {:credo, "~> 0.9.3", only: :dev, runtime: false},

      # Tests
      {:wallaby, github: "keathley/wallaby", runtime: false, only: :test},
      {:ex_machina, "~> 2.2", only: :test},
      {:faker, "~> 0.10", only: :test}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
