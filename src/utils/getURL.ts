import config from '@/config'

export const getFullApiURL = (url: string) => {
  return new URL(url, config.API_BASEURL).href
}

export const getFullAppURL = (url: string) => {
  return new URL(url, location.href).href
}
