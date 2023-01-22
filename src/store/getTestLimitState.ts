import { AxiosResponse } from 'axios'
import { RecoilValueReadOnly, selector } from 'recoil'

import request from '@/utils/request'

interface ILimit {
  id?: number | string
  name?: string
  ename?: string
  device_categories?: {
    id?: number | string
    name?: string
  }[]
}

const cache = new Map<number | string, RecoilValueReadOnly<ILimit>>()

const getTestLimitState = (id: number | string) => {
  if (cache.has(id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache.get(id)!
  }
  const key = `testLimit_${id}`
  const state = selector<ILimit>({
    key,
    get: async () => {
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: ILimit[]
          }>
        > = await request.get(`/api/v1/test_limits/${id}`)
        if (response.data.code !== 0) {
          throw new Error(response.data.message)
        }
        return response.data.data ?? {}
      } catch (err) {
        return {}
      }
    },
  })
  cache.set(id, state)
  return state
}

export default getTestLimitState
