import {
  ArrayTable,
  Form,
  FormCollapse,
  FormItem,
  FormLayout,
  Input,
  Radio,
  Space,
} from '@formily/antd'
import { createForm } from '@formily/core'
import { createSchemaField } from '@formily/react'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'

import request from '@/utils/request'

const SchemaField = createSchemaField({
  components: {
    ArrayTable,
    FormCollapse,
    FormItem,
    FormLayout,
    Input,
    Radio,
    Space,
  },
})

const Do = () => {
  const form = useMemo(() => createForm(), [])

  const [serverData, setServerData] = useState({
    id: undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: {} as any,
    loading: true,
  })

  const getData = useCallback(async () => {
    try {
      const layouts: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            list: any[]
            page: number
            page_size: number
            total: number
          }
        }>
      > = await request.get(`/api/v1/test_items/${1}/layouts`)
      if (layouts.data.code !== 0) {
        throw new Error(layouts.data.message ?? '')
      }
      if (!layouts.data.data?.list?.[0]) {
        // no data
        setServerData({
          id: undefined,
          schema: {},
          loading: false,
        })
        return
      }
      const firstId = layouts.data.data?.list?.[0]?.id
      const first: AxiosResponse<
        Partial<{
          code: number
          message: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: any
        }>
      > = await request.get(`/api/v1/test_items/${1}/layouts/${firstId}`)
      if (first.data.code !== 0) {
        throw new Error(first.data.message ?? '')
      }
      setServerData({
        id: firstId,
        schema: JSON.parse(first.data.data.content),
        loading: false,
      })
    } catch (err) {
      // todo
    }
  }, [])

  const initialize = useCallback(
    _.once(() => {
      getData()
    }),
    [],
  )
  useEffect(() => {
    initialize()
  }, [])
  return (
    <Form form={form} {...(serverData.schema?.form ?? {})}>
      <SchemaField schema={serverData.schema?.schema ?? {}} />
    </Form>
  )
}

export default Do
