import { Button, message, Space, Spin } from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { headerHeight } from '@/layouts/AdminLayout'
import request from '@/utils/request'

const Designable = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const params = useParams()

  const [serverData, setServerData] = useState({
    id: undefined,
    schema: '',
    loading: true,
  })

  const getData = async () => {
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
      > = await request.get(`/api/v1/test_items/${params.id}/layouts`)
      if (layouts.data.code !== 0) {
        throw new Error(layouts.data.message ?? '')
      }
      if (!layouts.data.data?.list?.[0]) {
        // no data
        setServerData({
          id: undefined,
          schema: '',
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
      > = await request.get(
        `/api/v1/test_items/${params.id}/layouts/${firstId}`,
      )
      if (first.data.code !== 0) {
        throw new Error(first.data.message ?? '')
      }
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const setSchema = (iframeRef.current?.contentWindow as any)?.setSchema
        setSchema(first.data.data.content)
        setServerData({
          id: firstId,
          schema: first.data.data.content,
          loading: false,
        })
      }, 1000)
    } catch (err) {
      // todo
    }
  }

  const initialize = _.once(getData)

  useEffect(() => {
    initialize()
  }, [params.id])

  const handleSave = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema = (iframeRef.current?.contentWindow as any)?.getSchema()
    try {
      if (serverData.id) {
        await request.put(
          `/api/v1/test_items/${params.id}/layouts/${serverData.id}`,
          {
            name: '默认布局',
            content: schema,
          },
        )
      } else {
        await request.post(`/api/v1/test_items/${params.id}/layouts`, {
          name: '默认布局',
          content: schema,
        })
      }
    } catch (err) {
      message.error((err as Error).message)
      return Promise.reject(err)
    }
  }

  return (
    <div
      className="m--6"
      style={{
        width: `calc(100% + 48px)`,
      }}
    >
      <Spin spinning={serverData.loading}>
        <div className="p-4 flex justify-between">
          <div></div>
          <Space>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          </Space>
        </div>
        <div
          className="w-full"
          style={{
            height: `calc(100vh - ${headerHeight}px)`,
          }}
        >
          <iframe
            ref={iframeRef}
            className="block border-none w-full h-full"
            src="/designable/index.html"
          />
        </div>
      </Spin>
    </div>
  )
}

export default Designable
