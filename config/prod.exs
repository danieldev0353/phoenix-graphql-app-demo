use Mix.Config

# For production, we often load configuration from external
# sources, such as your system environment. For this reason,
# you won't find the :http configuration below, but set inside
# YummyWeb.Endpoint.init/2 when load_from_system_env is
# true. Any dynamic configuration should be done there.
#
# Don't forget to configure the url host to something meaningful,
# Phoenix uses this information when generating URLs.
#
# Finally, we also include the path to a cache manifest
# containing the digested version of static files. This
# manifest is generated by the mix phx.digest task
# which you typically run after static files are built.
config :yummy, YummyWeb.Endpoint,
  load_from_system_env: true,
  http: [port: {:system, "PORT"}],
  url: [host: "${PUBLIC_HOST}", port: "${PUBLIC_PORT}"],
  cache_static_manifest: "priv/static/cache_manifest.json",
  secret_key_base: "${SECRET_KEY_BASE}",
  version: Mix.Project.config()[:version],
  server: true,
  root: "."

# Do not print debug messages in production
config :logger, level: :info

# Configures Bamboo
config :yummy, Yummy.Mailer,
  adapter: Bamboo.SendGridAdapter,
  api_key: "${SENDGRID_API_KEY}"

config :ex_aws,
  access_key_id: [{:system, "S3_KEY"}, :instance_role],
  secret_access_key: [{:system, "S3_SECRET"}, :instance_role],
  region: "eu-central-1"

config :arc,
  storage: Arc.Storage.S3,
  virtual_host: true,
  bucket: {:system, "S3_BUCKET"}

# Configure your database
config :yummy, Yummy.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "${POSTGRES_USER}",
  password: "${POSTGRES_PASSWORD}",
  database: "${POSTGRES_DB}",
  hostname: "${POSTGRES_HOST}",
  pool_size: "${DB_POOL_SIZE}"
