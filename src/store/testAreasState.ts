import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

interface ITestArea {
  id?: number | string
  name?: string
}

const key = 'testAreasState'

const testAreasState = selector<ITestArea[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            list: ITestArea[]
            page: number
            page_size: number
            total: number
          }
        }>
      > = await request.get('/api/v1/test_areas', {
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

export default testAreasState
