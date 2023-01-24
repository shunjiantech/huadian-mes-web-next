import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

interface ITestStation {
  id?: number | string
  name?: string
  test_area_id?: number | string
  test_area?: string
  test_users?: {
    id?: number | string
    name?: string
    nick_name?: string
  }[]
}

const key = 'testStationsState'

const testStationsState = selector<ITestStation[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            list: ITestStation[]
            page: number
            page_size: number
            total: number
          }
        }>
      > = await request.get('/api/v1/test_stations', {
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

export default testStationsState
