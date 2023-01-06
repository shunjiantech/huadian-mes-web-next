import { PlusOutlined } from '@ant-design/icons'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  FormDialog,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Radio,
  Select,
} from '@formily/antd'
import { createSchemaField } from '@formily/react'
import { Button, message, Popconfirm, Space, Typography } from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import request from '@/utils/request'

interface IField {
  id?: number | string
  name?: string
  ename?: string
  type?: 1 | 2 | 3 // 1：文本，2：数字，3：日期
  display_name?: string
  length?: number
  scale?: number
  unit?: string
  default_value?: string
  required?: 0 | 1 // 0：选填，1：必填
  description?: string
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    NumberPicker,
    Radio,
    Select,
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
    ename: {
      type: 'string',
      title: '英文名称',
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
    type: {
      type: 'number',
      title: '类型',
      required: true,
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
      },
      enum: [
        {
          label: '文本',
          value: 1,
        },
        {
          label: '数字',
          value: 2,
        },
        {
          label: '日期',
          value: 3,
        },
      ],
    },
    display_name: {
      type: 'string',
      title: '报告上显示名称',
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
    length: {
      type: 'number',
      title: '字段长度',
      required: true,
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
    scale: {
      type: 'number',
      title: '保留小数位数',
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        placeholder: '请输入',
      },
    },
    unit: {
      type: 'string',
      title: '字段单位',
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
    default_value: {
      type: 'string',
      title: '默认值',
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
    required: {
      type: 'number',
      title: '是否必填',
      required: true,
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      enum: [
        {
          label: '选填',
          value: 0,
        },
        {
          label: '必填',
          value: 1,
        },
      ],
    },
    description: {
      type: 'string',
      title: '字段描述',
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

const openFieldEditor = (paramsId?: number | string, id?: number | string) => {
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
            data: IField
          }>
        > = await request.get(`/api/v1/test_items/${paramsId}/fields/${id}`)
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
    let data = _.cloneDeep<IField>(payload.values)
    {
      // data transform
      data = {
        ...data,
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/test_items/${paramsId}/fields/${id}`, data)
      } else {
        await request.post(`/api/v1/test_items/${paramsId}/fields`, data)
      }
    } catch (err) {
      message.error((err as Error).message)
      return Promise.reject(err)
    }
    return next()
  })
  return dialog.open()
}

const FieldList = () => {
  const params = useParams()

  const tableActionRef = useRef<ActionType>()

  const [tableSelectedRowKeys, setTableSelectedRowKeys] = useState<
    (number | string)[]
  >([])

  const columns = useMemo<ProColumns<IField>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '名称',
        dataIndex: 'name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '英文名称',
        dataIndex: 'ename',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '类型',
        dataIndex: 'type',
        valueEnum: {
          1: '文本',
          2: '数字',
          3: '日期',
        },
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '报告上显示名称',
        dataIndex: 'display_name',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '字段长度',
        dataIndex: 'length',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '保留小数位数',
        dataIndex: 'scale',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '字段单位',
        dataIndex: 'unit',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '默认值',
        dataIndex: 'default_value',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '是否必填',
        dataIndex: 'required',
        hideInSearch: true,
        valueEnum: {
          0: '选填',
          1: '必填',
        },
        render: (dom) => <div className="min-w-14">{dom}</div>,
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
                  await openFieldEditor(params.id, record.id)
                  tableActionRef.current?.reload()
                }}
              >
                编辑
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(
                    `/api/v1/test_items/${params.id}/fields/${record.id}`,
                  )
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
      <ProTable<IField>
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...otherParams }) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: IField[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get(`/api/v1/test_items/${params.id}/fields`, {
              params: {
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
                    `/api/v1/test_items/${
                      params.id
                    }/fields/${selectedRowKeys.join(',')}`,
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
                await openFieldEditor(params.id)
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

export default FieldList
