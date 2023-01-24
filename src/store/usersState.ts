import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

interface IUser {
  id?: number | string
  user_name?: string
  nick_name?: string
}

const key = 'usersState'

const usersState = selector<IUser[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            list: IUser[]
            page: number
            page_size: number
            total: number
          }
        }>
      > = await request.get('/api/v1/users', {
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

export default usersState
