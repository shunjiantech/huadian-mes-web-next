import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

interface IExtraParamType {
  code?: string
  name?: string
}

const key = 'extraParamTypesState'

const extraParamTypesState = selector<IExtraParamType[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: IExtraParamType[]
        }>
      > = await request.get('/api/v1/extra_param_types')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? []
    } catch (err) {
      return []
    }
  },
})

export default extraParamTypesState
