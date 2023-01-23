import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

export interface IProductType {
  id: number | string
  code?: string
  name: string
  children?: IProductType[]
}

const key = 'productTypesState'

const productTypesState = selector<IProductType[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: IProductType[]
        }>
      > = await request.get('/api/v1/device_category_types')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? []
    } catch (err) {
      return []
    }
  },
})

export default productTypesState
