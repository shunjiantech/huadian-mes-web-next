import _ from 'lodash-es'

interface Config {
  APP_TITLE: string
  APP_BASEURL: string
}

const config: Config = {
  APP_TITLE: import.meta.env.VITE_APP_TITLE ?? '',
  APP_BASEURL: new URL(import.meta.env.VITE_APP_BASEURL || '/', location.href)
    .href,
}

const windowConfig =
  (
    window as {
      __CONFIG__?: Partial<Config>
    }
  ).__CONFIG__ ?? {}

_.keys(config).forEach((value) => {
  const key = value as keyof Config
  const windowConfigValue = windowConfig[key]
  if (windowConfigValue) {
    config[key] = windowConfigValue
  }
})

export default config
