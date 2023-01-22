import { AxiosResponse } from 'axios'
import { RecoilValueReadOnly, selector } from 'recoil'

import request from '@/utils/request'

interface ILimitField {
  code?: string
  name?: string
  type?: string
  options?: {
    id?: number | string
    code?: string
    name?: string
  }[]
}

const cache = new Map<number | string, RecoilValueReadOnly<ILimitField[]>>()

const getTestLimitFieldsState = (id: number | string) => {
  if (cache.has(id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache.get(id)!
  }
  const key = `testLimitFields_${id}`
  const state = selector<ILimitField[]>({
    key,
    get: async () => {
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: ILimitField[]
          }>
        > = await request.get(`/api/v1/test_limits/${id}/fields`)
        if (response.data.code !== 0) {
          throw new Error(response.data.message)
        }
        return response.data.data ?? []
      } catch (err) {
        return []
      }
    },
  })
  cache.set(id, state)
  return state
}

export default getTestLimitFieldsState
