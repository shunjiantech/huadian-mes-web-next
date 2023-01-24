import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { FormDialog, FormItem, FormLayout, Input } from '@formily/antd'
import { createSchemaField } from '@formily/react'
import { Button, message, Popconfirm, Space, Typography } from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useMemo, useRef } from 'react'

import request from '@/utils/request'

export interface ITestInstrumentType {
  id?: number | string
  name?: string
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
      title: '类型名称',
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
        allowClear: true,
      },
    },
  },
}

const openTestInstrumentTypeEditor = (id?: number | string) => {
  const dialog = FormDialog(id ? '编辑' : '新增', () => (
    <FormLayout labelCol={5} wrapperCol={19}>
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
            data: ITestInstrumentType
          }>
        > = await request.get(`/api/v1/instrument_types/${id}`)
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
    let data = _.cloneDeep<ITestInstrumentType>(payload.values)
    {
      // data transform
      data = {
        ...data,
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/instrument_types/${id}`, data)
      } else {
        await request.post('/api/v1/instrument_types', data)
      }
    } catch (err) {
      message.error((err as Error).message)
      return Promise.reject(err)
    }
    return next()
  })
  return dialog.open()
}

const List = () => {
  const tableActionRef = useRef<ActionType>()

  const columns = useMemo<ProColumns<ITestInstrumentType>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '类型名称',
        dataIndex: 'name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '操作',
        key: 'option',
        valueType: 'option',
        render: (dom, record) => (
          <div className="min-w-36">
            <Space size={['small', 0]} wrap>
              <Typography.Link
                onClick={async () => {
                  await openTestInstrumentTypeEditor(record.id)
                  tableActionRef.current?.reload()
                }}
              >
                重命名
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(`/api/v1/instrument_types/${record.id}`)
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
    <PageContainer>
      <ProTable<ITestInstrumentType>
        actionRef={tableActionRef}
        request={async (params) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: ITestInstrumentType[]
              }>
            > = await request.get('/api/v1/instrument_types/tree', {
              params,
            })
            if (response.data.code !== 0) {
              throw new Error(response.data.message ?? '')
            }
            const list = response.data.data ?? []
            return {
              data: list,
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
        search={false}
        toolbar={{
          title: '数据列表',
          actions: [
            <Button
              key="new"
              type="primary"
              icon={<PlusOutlined />}
              onClick={async () => {
                await openTestInstrumentTypeEditor()
                tableActionRef.current?.reload()
              }}
            >
              新增
            </Button>,
          ],
        }}
        options={false}
        pagination={false}
      />
      <FormDialog.Portal />
    </PageContainer>
  )
}

export default List
