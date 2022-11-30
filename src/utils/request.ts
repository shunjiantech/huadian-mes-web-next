import axios from 'axios'

import config from '@/config'

const request = axios.create({
  baseURL: config.API_BASEURL,
  timeout: config.API_TIMEOUT,
})

request.interceptors.request.use(
  (config) => {
    return config
  },
  (err) => Promise.reject(err),
)

request.interceptors.response.use(
  (response) => {
    return response
  },
  (err) => Promise.reject(err),
)

export default request
