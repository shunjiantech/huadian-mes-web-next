import { PlusOutlined } from '@ant-design/icons'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  FormDialog,
  FormItem,
  FormLayout,
  Input,
  SelectTable,
} from '@formily/antd'
import { createSchemaField } from '@formily/react'
import { Button, message, Popconfirm, Space, Tag, Typography } from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import usersState from '@/store/usersState'
import { isBigIntStr } from '@/utils/bigintString'
import request from '@/utils/request'

interface IStation {
  id?: number | string
  name?: string
  code?: string
  description?: string
  test_area_id?: number | string
  test_user_ids?: (number | string)[]
  test_users?: {
    id?: number | string
    name?: string
    nick_name?: string
  }[]
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    SelectTable,
  },
})

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '工位名称',
      required: true,
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
    code: {
      type: 'string',
      title: '工位编码',
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
    description: {
      type: 'string',
      title: '工位描述',
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Input.TextArea',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
    test_user_ids: {
      type: 'array',
      title: '人员',
      'x-decorator': 'FormItem',
      'x-component': 'SelectTable',
      'x-component-props': {
        mode: 'multiple',
        primaryKey: 'id',
        pagination: false,
      },
      enum: '{{users}}',
      properties: {
        user_name: {
          title: '用户名',
          type: 'string',
          'x-component': 'SelectTable.Column',
        },
        nick_name: {
          title: '昵称',
          type: 'string',
          'x-component': 'SelectTable.Column',
        },
      },
    },
  },
}

const openStationEditor = (
  paramsId?: number | string,
  id?: number | string,
) => {
  const dialog = FormDialog(id ? '编辑' : '新增', () => {
    const users = useRecoilValue(usersState)

    return (
      <FormLayout labelCol={5} wrapperCol={19}>
        <SchemaField schema={schema} scope={{ users }} />
      </FormLayout>
    )
  })
  if (id) {
    dialog.forOpen(async (payload, next) => {
      let initialValues
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: IStation
          }>
        > = await request.get(`/api/v1/test_stations/${id}`)
        if (response.data.code !== 0) {
          throw new Error(response.data.message ?? '')
        }
        let data = _.cloneDeep(response.data.data ?? {})
        {
          // data transform
          data = {
            ...data,
            id: undefined,
            test_users: undefined,
            test_user_ids: data.test_users?.map(({ id }) => id ?? 0) ?? [],
          }
        }
        initialValues = data
      } catch (err) {
        message.error((err as Error).message)
      }
      next({ initialValues })
    })
  }
  dialog.forConfirm(async (payload, next) => {
    let data = _.cloneDeep<IStation>(payload.values)
    {
      // data transform
      data = {
        test_area_id: paramsId,
        ...data,
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/test_stations/${id}`, data)
      } else {
        await request.post(`/api/v1/test_stations`, data)
      }
    } catch (err) {
      message.error((err as Error).message)
      return Promise.reject(err)
    }
    return next()
  })
  return dialog.open()
}

const StationList = () => {
  const params = useParams()

  const paramsId = useMemo(
    () => (isBigIntStr(params.id) ? params.id : Number(params.id)),
    [params.id],
  )

  const tableActionRef = useRef<ActionType>()

  const [tableSelectedRowKeys, setTableSelectedRowKeys] = useState<
    (number | string)[]
  >([])

  const columns = useMemo<ProColumns<IStation>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '工位名称',
        dataIndex: 'name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '工位编码',
        dataIndex: 'code',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '工位描述',
        dataIndex: 'description',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '人员',
        dataIndex: 'test_users',
        render: (dom, record) => (
          <div className="min-w-14">
            <Space wrap>
              {record.test_users?.map(({ name, nick_name }, index) => (
                <Tag className="mr-0!" key={index}>
                  {nick_name ?? name}
                </Tag>
              ))}
            </Space>
          </div>
        ),
      },
      {
        title: '操作',
        key: 'option',
        valueType: 'option',
        render: (dom, record) => (
          <div className="min-w-16">
            <Space size={['small', 0]} wrap>
              <Typography.Link
                onClick={async () => {
                  await openStationEditor(paramsId, record.id)
                  tableActionRef.current?.reload()
                }}
              >
                编辑
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(`/api/v1/test_stations/${record.id}`)
                  tableActionRef.current?.reload()
                }}
              >
                <Typography.Link>删除</Typography.Link>
              </Popconfirm>
            </Space>
          </div>
        ),
      },
    ],
    [tableActionRef],
  )

  return (
    <>
      <ProTable<IStation>
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...otherParams }) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: IStation[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get('/api/v1/test_stations', {
              params: {
                test_area_id: paramsId,
                ...otherParams,
                page: current,
                page_size: pageSize,
              },
            })
            if (response.data.code !== 0) {
              throw new Error(response.data.message ?? '')
            }
            const list = response.data.data?.list ?? []
            const total = response.data.data?.total ?? 0
            if (current && pageSize) {
              const maxPage = Math.ceil(total / pageSize)
              if (current > 1 && current > maxPage) {
                tableActionRef.current?.reload(true)
                return {
                  success: false,
                }
              }
            }
            setTableSelectedRowKeys((tableSelectedRowKeys) => {
              return tableSelectedRowKeys.filter((key) => {
                return list.find(({ id }) => id === key)
              })
            })
            return {
              data: list,
              total,
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
        form={{
          syncToUrl: true,
          syncToInitialValues: false,
        }}
        rowKey="id"
        rowSelection={{
          alwaysShowAlert: true,
          selectedRowKeys: tableSelectedRowKeys,
          onChange: (selectedRowKeys) => {
            setTableSelectedRowKeys(selectedRowKeys)
          },
        }}
        tableAlertOptionRender={({ selectedRowKeys }) => {
          return (
            <Space>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(
                    `/api/v1/test_stations/${selectedRowKeys.join(',')}`,
                  )
                  tableActionRef.current?.reload()
                }}
              >
                <Typography.Link disabled={selectedRowKeys.length === 0}>
                  批量删除
                </Typography.Link>
              </Popconfirm>
            </Space>
          )
        }}
        search={false}
        toolbar={{
          title: '数据列表',
          actions: [
            <Button
              key="new"
              type="primary"
              icon={<PlusOutlined />}
              onClick={async () => {
                await openStationEditor(paramsId)
                tableActionRef.current?.reload()
              }}
            >
              新增
            </Button>,
          ],
        }}
        options={false}
        pagination={{
          size: 'default',
          defaultPageSize: 10,
        }}
      />
      <FormDialog.Portal />
    </>
  )
}

export default StationList
