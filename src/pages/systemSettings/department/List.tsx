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

interface IDepartment {
  pid?: number | string
  id?: number | string
  name?: string
  code?: string
  description?: string
  children?: IDepartment[]
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
      title: '部门名称',
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
      title: '部门编码',
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
      title: '部门描述',
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
  },
}

const openDepartmentEditor = (id?: number | string, parent?: IDepartment) => {
  const dialog = FormDialog(
    id ? '编辑' : parent ? `${parent.name} - 新增子部门` : '新增',
    () => (
      <FormLayout labelCol={5} wrapperCol={19}>
        <SchemaField schema={schema} />
      </FormLayout>
    ),
  )
  if (id) {
    dialog.forOpen(async (payload, next) => {
      let initialValues
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: IDepartment
          }>
        > = await request.get(`/api/v1/departments/${id}`)
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
    const data = _.cloneDeep<IDepartment>(payload.values)
    {
      // data transform
      if (!id && parent) {
        data.pid = parent.id
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/departments/${id}`, data)
      } else {
        await request.post('/api/v1/departments', data)
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

  const columns = useMemo<ProColumns<IDepartment>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 76,
      },
      {
        title: '部门名称',
        dataIndex: 'name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '部门编码',
        dataIndex: 'code',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '部门描述',
        dataIndex: 'description',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '操作',
        key: 'option',
        valueType: 'option',
        render: (dom, record) => (
          <div className="min-w-18">
            <Space size={['small', 0]} wrap>
              <Typography.Link
                disabled={!!record.pid}
                onClick={async () => {
                  await openDepartmentEditor(undefined, record)
                  tableActionRef.current?.reload()
                }}
              >
                新增子部门
              </Typography.Link>
              <Typography.Link
                onClick={async () => {
                  await openDepartmentEditor(record.id)
                  tableActionRef.current?.reload()
                }}
              >
                编辑
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(`/api/v1/departments/${record.id}`)
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
      <ProTable<IDepartment>
        actionRef={tableActionRef}
        request={async (params) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: IDepartment[]
              }>
            > = await request.get('/api/v1/departments/tree', {
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
        toolbar={{
          title: '数据列表',
          actions: [
            <Button
              key="new"
              type="primary"
              icon={<PlusOutlined />}
              onClick={async () => {
                await openDepartmentEditor()
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
