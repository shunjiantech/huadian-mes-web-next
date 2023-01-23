import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import { IDepartment } from '@/pages/systemSettings/department/List'
import request from '@/utils/request'

const key = 'departmentsState'

const departmentsState = selector<IDepartment[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: IDepartment[]
        }>
      > = await request.get('/api/v1/departments/tree')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? []
    } catch (err) {
      return []
    }
  },
})

export default departmentsState
