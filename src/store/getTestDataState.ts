import { AxiosResponse } from 'axios'
import { RecoilValueReadOnly, selector } from 'recoil'

import request from '@/utils/request'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ITestData = any

const cache = new Map<number | string, RecoilValueReadOnly<ITestData>>()

const getTestDataState = (
  device_id: number | string,
  test_item_id: number | string,
) => {
  const id = `${device_id}-${test_item_id}`

  if (cache.has(id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache.get(id)!
  }
  const key = `testData_${id}`
  const state = selector<ITestData>({
    key,
    get: async () => {
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: ITestData
          }>
        > = await request.get('/api/v1/tasks/test_data', {
          params: {
            device_id,
            test_item_id,
          },
        })
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

export default getTestDataState
