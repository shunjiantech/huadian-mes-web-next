import { AxiosResponse } from 'axios'
import { RecoilValueReadOnly, selector } from 'recoil'

import request from '@/utils/request'

interface ITestStationUsers {
  id?: number | string
  name?: string
  nick_name?: string
}

const cache = new Map<
  number | string,
  RecoilValueReadOnly<ITestStationUsers[]>
>()

const getTestStationUsersState = (
  testStationId: number | string,
  productCategoryId: number | string,
) => {
  const id = `${testStationId}_${productCategoryId}`
  if (cache.has(id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache.get(id)!
  }
  const key = `testStationUsers_${id}`
  const state = selector<ITestStationUsers[]>({
    key,
    get: async () => {
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: ITestStationUsers[]
          }>
        > = await request.get(
          `/api/v1/test_stations/${testStationId}/test_users`,
          {
            params: {
              device_category_id: productCategoryId,
            },
          },
        )
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

export default getTestStationUsersState
