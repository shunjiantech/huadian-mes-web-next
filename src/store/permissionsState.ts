import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

export interface IPermission {
  id: number | string
  code?: string
  name: string
}

const key = 'permissionsState'

const permissionsState = selector<IPermission[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: IPermission[]
        }>
      > = await request.get('/api/v1/permissions')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? []
    } catch (err) {
      return []
    }
  },
})

export default permissionsState
