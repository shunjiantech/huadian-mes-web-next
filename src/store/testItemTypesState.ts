import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

export interface ITestItemType {
  id?: number | string
  code?: string
  name?: string
}

const key = 'testItemTypesState'

const testItemTypesState = selector({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: ITestItemType[]
        }>
      > = await request.get('/api/v1/test_item_types')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? []
    } catch (err) {
      return []
    }
  },
})

export default testItemTypesState
