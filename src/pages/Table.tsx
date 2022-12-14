import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { FormDialog, FormItem, FormLayout, Input } from '@formily/antd'
import { createSchemaField } from '@formily/react'
import { Button, Popconfirm, Space, Typography } from 'antd'
import { useMemo, useRef } from 'react'

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
  },
})

const schema = {
  type: 'object',
  properties: {
    field_1: {
      type: 'string',
      title: '字段1',
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
    field_2: {
      type: 'string',
      title: '字段2',
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
    field_3: {
      type: 'string',
      title: '字段3',
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
    field_4: {
      type: 'string',
      title: '字段4',
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
    field_5: {
      type: 'string',
      title: '字段5',
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
  },
}

const openEditor = (id?: number | string) => {
  const dialog = FormDialog(id ? '编辑' : '新增', () => (
    <FormLayout labelCol={4} wrapperCol={20}>
      <SchemaField schema={schema} />
    </FormLayout>
  ))
  if (id) {
    dialog.forOpen(async (payload, next) => {
      let initialValues
      next({ initialValues })
    })
  }
  dialog.forConfirm(async (payload, next) => {
    next()
  })
  return dialog.open()
}

const Table = () => {
  const tableActionRef = useRef<ActionType>()

  const columns = useMemo<ProColumns[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '字段1',
        dataIndex: 'field_1',
      },
      {
        title: '字段2',
        dataIndex: 'field_2',
      },
      {
        title: '字段3',
        dataIndex: 'field_3',
      },
      {
        title: '字段4',
        dataIndex: 'field_4',
      },
      {
        title: '字段5',
        dataIndex: 'field_5',
      },
      {
        title: '操作',
        key: 'option',
        valueType: 'option',
        render: (_, record) => (
          <Space>
            <Typography.Link
              onClick={async () => {
                await openEditor(record.id)
                tableActionRef.current?.reload()
              }}
            >
              编辑
            </Typography.Link>
            <Popconfirm
              title="您确定要删除吗？"
              onConfirm={async () => {
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
    <>
      <PageContainer>
        <ProTable
          actionRef={tableActionRef}
          request={async ({ current, pageSize }) => {
            if (!current || !pageSize) {
              return {
                success: false,
              }
            }
            await new Promise((resolve) => {
              setTimeout(resolve, 1000)
            })
            return {
              data: Array.from({ length: pageSize }).map((_, index) => {
                const i = (current - 1) * pageSize + index + 1
                return {
                  id: i,
                  field_1: `A_${i}`,
                  field_2: `B_${i}`,
                  field_3: `C_${i}`,
                  field_4: `D_${i}`,
                  field_5: `E_${i}`,
                }
              }),
              total: 1001,
              success: true,
            }
          }}
          columns={columns}
          columnEmptyText={false}
          rowKey="id"
          rowSelection={{
            alwaysShowAlert: true,
          }}
          toolbar={{
            title: '标题',
            subTitle: '副标题',
            tooltip: '标题提示',
            actions: [
              <Button
                key="new"
                type="primary"
                icon={<PlusOutlined />}
                onClick={async () => {
                  await openEditor()
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
      </PageContainer>
      <FormDialog.Portal />
    </>
  )
}

export default Table
