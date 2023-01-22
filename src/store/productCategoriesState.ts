import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

export interface IProductCategory {
  id: number | string
  code?: string
  name: string
  children?: IProductCategory[]
}

const key = 'productCategoriesState'

const productCategoriesState = selector<IProductCategory[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: IProductCategory[]
        }>
      > = await request.get('/api/v1/device_categories/tree')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? []
    } catch (err) {
      return []
    }
  },
})

export default productCategoriesState
