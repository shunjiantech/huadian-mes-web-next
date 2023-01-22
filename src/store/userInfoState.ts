import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

interface IUserInfo {
  id?: number | string
  user_name?: string
  nick_name?: string
  avatar?: string
  avatar_url?: string
}

const key = 'userInfoState'

const userInfoState = selector<IUserInfo>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: IUserInfo[]
        }>
      > = await request.get('/api/v1/users/info')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? {}
    } catch (err) {
      return {}
    }
  },
})

export default userInfoState
