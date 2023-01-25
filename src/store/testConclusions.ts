import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import request from '@/utils/request'

interface ITestConclusion {
  id?: number | string
  name?: string
  code?: string
  description?: string
}

const key = 'testConclusionsState'

const testConclusionsState = selector<ITestConclusion[]>({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: ITestConclusion[]
        }>
      > = await request.get('/api/v1/test_conclusions')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? []
    } catch (err) {
      return []
    }
  },
})

export default testConclusionsState
