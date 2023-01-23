import axios from 'axios'

import config from '@/config'
import { token } from '@/store/tokenState'
import {
  recursionBigIntToString,
  recursionStringToBigInt,
  urlStringToBigInt,
} from '@/utils//bigintString'

export const getBearerToken = () => `Bearer ${token}`

const request = axios.create({
  baseURL: config.API_BASEURL,
  timeout: config.API_TIMEOUT,
})

request.interceptors.request.use(
  (config) => {
    {
      if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    {
      // bigintString to bigint
      if (config.url) {
        config.url = urlStringToBigInt(config.url)
      }
      if (config.params) {
        config.params = recursionStringToBigInt(config.params)
      }
      if (config.data) {
        config.data = recursionStringToBigInt(config.data)
      }
    }
    return config
  },
  (err) => Promise.reject(err),
)

request.interceptors.response.use(
  (response) => {
    {
      // bigint to bigintString
      response.data = recursionBigIntToString(response.data)
    }
    return response
  },
  (err) => Promise.reject(err),
)

export default request
