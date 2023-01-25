import { AxiosResponse } from 'axios'
import { RecoilValueReadOnly, selector } from 'recoil'

import request from '@/utils/request'

interface ITestLayout {
  id?: number | string
  name?: string
  content?: string
}

const cache = new Map<number | string, RecoilValueReadOnly<ITestLayout[]>>()

const getTestItemLayoutsState = (id: number | string) => {
  if (cache.has(id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache.get(id)!
  }
  const key = `testItemLayout_${id}`
  const state = selector<ITestLayout[]>({
    key,
    get: async () => {
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: {
              list: ITestLayout[]
              page: number
              page_size: number
              total: number
            }
          }>
        > = await request.get(`/api/v1/test_items/${id}/layouts`, {
          params: {
            page: 1,
            page_size: 10000,
          },
        })
        if (response.data.code !== 0) {
          throw new Error(response.data.message)
        }
        return response.data.data?.list ?? []
      } catch (err) {
        return []
      }
    },
  })
  cache.set(id, state)
  return state
}

export default getTestItemLayoutsState
