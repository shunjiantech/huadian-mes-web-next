import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { message, Popconfirm, Space, Tag, Typography } from 'antd'
import { AxiosResponse } from 'axios'
import queryString from 'query-string'
import { useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'

import request from '@/utils/request'

interface ITestProgress {
  test_item_id?: number | string
  test_item_name?: string
  test_item_ename?: string
  priority?: number
  test_area_id?: number | string
  test_area?: string
  test_station_id?: number | string
  test_station?: string
  test_status?: 0 | 1 //试验状态：0：未完成，1：完成
  test_conclusion?: string
  test_time?: number | string
}

const TestProgress = () => {
  const params = useParams()

  const tableActionRef = useRef<ActionType>()

  const columns = useMemo<ProColumns<ITestProgress>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '试验项目',
        dataIndex: 'test_item_name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '试验区域',
        dataIndex: 'test_area',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '试验工位',
        dataIndex: 'test_station',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '试验结论',
        dataIndex: 'test_conclusion',
        render: (dom, record) => (
          <div className="min-w-14">
            <Tag
              color={
                record.test_status === 0
                  ? 'warning'
                  : record.test_conclusion === '符合'
                  ? 'success'
                  : record.test_conclusion === '不符合'
                  ? 'error'
                  : 'processing'
              }
            >
              {record.test_status === 0 ? '未完成' : dom}
            </Tag>
          </div>
        ),
      },
      {
        title: '开始时间',
        dataIndex: 'test_time',
        valueType: 'dateTime',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '操作',
        key: 'option',
        valueType: 'option',
        render: (dom, record) => (
          <div className="min-w-16">
            <Space size={['small', 0]} wrap>
              {record.test_status === 1 ? (
                <Link
                  to={{
                    pathname: '../test',
                    search: queryString.stringify({
                      items: JSON.stringify([
                        {
                          id: record.test_item_id,
                          name: record.test_item_name,
                          view: 1,
                        },
                      ]),
                      test_station_id: record.test_station_id,
                      view: 1,
                    }),
                  }}
                >
                  查看
                </Link>
              ) : (
                <Typography.Link disabled>查看</Typography.Link>
              )}
              <Popconfirm
                title="您确定要重做吗？"
                onConfirm={async () => {
                  await request.delete('/api/v1/tasks/redo', {
                    data: {
                      device_id: params.device_id,
                      test_item_id: record.test_item_id,
                    },
                  })
                  tableActionRef.current?.reload()
                }}
              >
                <Typography.Link disabled={record.test_status !== 1}>
                  重做
                </Typography.Link>
              </Popconfirm>
            </Space>
          </div>
        ),
      },
    ],
    [tableActionRef],
  )

  return (
    <PageContainer>
      <ProTable<ITestProgress>
        actionRef={tableActionRef}
        request={async () => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: ITestProgress[]
              }>
            > = await request.get('/api/v1/tasks/test_progress', {
              params: {
                device_id: params.device_id,
              },
            })
            if (response.data.code !== 0) {
              throw new Error(response.data.message ?? '')
            }
            const list = response.data.data ?? []
            return {
              data: list.map((item, _index) => ({ ...item, _index })),
              success: true,
            }
          } catch (err) {
            message.error((err as Error).message)
            return {
              success: false,
            }
          }
        }}
        columns={columns}
        columnEmptyText={false}
        rowKey="_index"
        search={false}
        toolbar={{
          title: '数据列表',
        }}
        options={false}
        pagination={false}
      />
    </PageContainer>
  )
}

export default TestProgress
