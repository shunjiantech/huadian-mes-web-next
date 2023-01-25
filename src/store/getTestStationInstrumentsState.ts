import { AxiosResponse } from 'axios'
import { RecoilValueReadOnly, selector } from 'recoil'

import request from '@/utils/request'

interface ITestStationInstruments {
  id?: number | string
  name?: string
  model?: string
  code?: string
  valid_until?: number | string
  correct_level?: number | string
}

const cache = new Map<
  number | string,
  RecoilValueReadOnly<ITestStationInstruments[]>
>()

const getTestStationInstrumentsState = (id: number | string) => {
  if (cache.has(id)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache.get(id)!
  }
  const key = `testStationInstruments_${id}`
  const state = selector<ITestStationInstruments[]>({
    key,
    get: async () => {
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: ITestStationInstruments[]
          }>
        > = await request.get(`/api/v1/test_stations/${id}/instruments`)
        if (response.data.code !== 0) {
          throw new Error(response.data.message)
        }
        return response.data.data ?? []
      } catch (err) {
        return []
      }
    },
  })
  cache.set(id, state)
  return state
}

export default getTestStationInstrumentsState
