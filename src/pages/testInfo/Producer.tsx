import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { FormDialog, FormItem, FormLayout, Input } from '@formily/antd'
import { createSchemaField } from '@formily/react'
import { Button, message, Popconfirm, Space, Typography } from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useMemo, useRef, useState } from 'react'

import request from '@/utils/request'

interface IProducer {
  id?: number | string
  name?: string
  address?: string
  postcode?: string
  contact?: string
  tel?: string
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
  },
})

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '名称',
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
    address: {
      type: 'string',
      title: '地址',
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
    postcode: {
      type: 'string',
      title: '邮编',
      'x-validator': [
        {
          pattern: '^\\d{6}$',
          message: '不是有效的邮编',
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
    contact: {
      type: 'string',
      title: '联系人',
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
    tel: {
      type: 'string',
      title: '联系电话',
      required: true,
      'x-validator': [
        {
          pattern: '^1[3456789]\\d{9}$|^0\\d{2,3}-\\d{7,8}$',
          message: '不是有效的电话号码',
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
  },
}

const openProducerEditor = (id?: number | string) => {
  const dialog = FormDialog(id ? '编辑' : '新增', () => (
    <FormLayout labelCol={4} wrapperCol={20}>
      <SchemaField schema={schema} />
    </FormLayout>
  ))
  if (id) {
    dialog.forOpen(async (payload, next) => {
      let initialValues
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: IProducer
          }>
        > = await request.get(`/api/v1/manufacturers/${id}`)
        if (response.data.code !== 0) {
          throw new Error(response.data.message ?? '')
        }
        let data = _.cloneDeep(response.data.data ?? {})
        {
          // data transform
          data = {
            ...data,
            id: undefined,
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
    let data = _.cloneDeep<IProducer>(payload.values)
    {
      // data transform
      data = {
        ...data,
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/manufacturers/${id}`, data)
      } else {
        await request.post('/api/v1/manufacturers', data)
      }
    } catch (err) {
      message.error((err as Error).message)
      return Promise.reject(err)
    }
    return next()
  })
  return dialog.open()
}

const Producer = () => {
  const tableActionRef = useRef<ActionType>()

  const [tableSelectedRowKeys, setTableSelectedRowKeys] = useState<
    (number | string)[]
  >([])

  const columns = useMemo<ProColumns<IProducer>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '地址',
        dataIndex: 'address',
        hideInSearch: true,
      },
      {
        title: '邮编',
        dataIndex: 'postcode',
        hideInSearch: true,
      },
      {
        title: '联系人',
        dataIndex: 'contact',
        hideInSearch: true,
      },
      {
        title: '联系电话',
        dataIndex: 'tel',
        hideInSearch: true,
      },
      {
        title: '操作',
        key: 'option',
        valueType: 'option',
        width: 100,
        render: (_, record) => (
          <Space wrap>
            <Typography.Link
              onClick={async () => {
                await openProducerEditor(record.id)
                tableActionRef.current?.reload()
              }}
            >
              编辑
            </Typography.Link>
            <Popconfirm
              title="您确定要删除吗？"
              onConfirm={async () => {
                await request.delete(`/api/v1/manufacturers/${record.id}`)
                tableActionRef.current?.reload()
              }}
            >
              <Typography.Link>删除</Typography.Link>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [tableActionRef],
  )

  return (
    <PageContainer>
      <ProTable<IProducer>
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...params }) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: IProducer[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get('/api/v1/manufacturers', {
              params: {
                ...params,
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
              if (current > maxPage) {
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
                    `/api/v1/manufacturers/${selectedRowKeys.join(',')}`,
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
        toolbar={{
          title: '数据列表',
          actions: [
            <Button
              key="new"
              type="primary"
              icon={<PlusOutlined />}
              onClick={async () => {
                await openProducerEditor()
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
    </PageContainer>
  )
}

export default Producer
