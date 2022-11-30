import { getFullAppURL } from '@/utils/getURL'

interface Config {
  TITLE: string
  API_BASEURL: string
  API_TIMEOUT: number
}

const config: Config = {
  TITLE: import.meta.env.VITE_TITLE ?? '',
  API_BASEURL: getFullAppURL(import.meta.env.VITE_API_BASEURL || '/'),
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '0'),
}

const windowConfig =
  (
    window as {
      __CONFIG__?: Partial<Config>
    }
  ).__CONFIG__ ?? {}

{
  let key: keyof Config
  for (key in config) {
    switch (key) {
      case 'TITLE':
      case 'API_BASEURL':
        {
          const windowConfigValue = windowConfig[key]
          if (windowConfigValue) {
            config[key] = windowConfigValue
          }
        }
        break
      case 'API_TIMEOUT':
        {
          const windowConfigValue = windowConfig[key]
          if (windowConfigValue) {
            config[key] = windowConfigValue
          }
        }
        break
    }
  }
}

export default config
