import { AxiosResponse } from 'axios'
import { selector } from 'recoil'

import { ITestInstrumentType } from '@/pages/laboratoryInfo/testInstrumentType/List'
import request from '@/utils/request'

const key = 'testInstrumentTypesState'

const testInstrumentTypesState = selector({
  key,
  get: async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: ITestInstrumentType[]
        }>
      > = await request.get('/api/v1/instrument_types/tree')
      if (response.data.code !== 0) {
        throw new Error(response.data.message)
      }
      return response.data.data ?? []
    } catch (err) {
      return []
    }
  },
})

export default testInstrumentTypesState
