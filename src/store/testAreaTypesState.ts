import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

interface ITestAreaType {
  id?: number | string
  name?: string
  code?: string
}

const key = 'testAreaTypesState'

const testAreaTypesState = selector<ITestAreaType[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: ITestAreaType[]
        }>
      > = await request.get('/api/v1/test_area_types')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? []
    } catch (err) {
      return []
    }
  },
})

export default testAreaTypesState
