import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { FormDialog, FormItem, FormLayout, Input, Select } from '@formily/antd'
import { createSchemaField } from '@formily/react'
import { Button, message, Popconfirm, Space, Typography } from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useMemo, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil'

import testAreaTypesState from '@/store/testAreaTypesState'
import request from '@/utils/request'

interface ITestArea {
  id?: number | string
  name?: string
  code?: string
  test_area_type_id?: number | string
  test_area_type?: string
  description?: string
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
  },
})

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '区域名称',
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
      title: '区域编码',
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
    test_area_type_id: {
      type: 'string',
      title: '区域类型',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
      },
      enum: '{{testAreaTypesEnumOptions}}',
    },
    description: {
      type: 'string',
      title: '区域描述',
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

const openTestAreaEditor = (id?: number | string) => {
  const dialog = FormDialog(id ? '编辑' : '新增', () => {
    const testAreaTypes = useRecoilValue(testAreaTypesState)
    const testAreaTypesEnumOptions = useMemo(() => {
      return testAreaTypes.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
    }, [testAreaTypes])

    return (
      <FormLayout labelCol={5} wrapperCol={19}>
        <SchemaField schema={schema} scope={{ testAreaTypesEnumOptions }} />
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
            data: ITestArea
          }>
        > = await request.get(`/api/v1/test_areas/${id}`)
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
    let data = _.cloneDeep<ITestArea>(payload.values)
    {
      // data transform
      data = {
        ...data,
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/test_areas/${id}`, data)
      } else {
        await request.post('/api/v1/test_areas', data)
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

  const [tableSelectedRowKeys, setTableSelectedRowKeys] = useState<
    (number | string)[]
  >([])

  const testAreaTypes = useRecoilValue(testAreaTypesState)

  const columns = useMemo<ProColumns<ITestArea>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '区域名称',
        dataIndex: 'name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '区域编码',
        dataIndex: 'code',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '区域类型',
        dataIndex: 'test_area_type_id',
        hideInTable: true,
        valueEnum: _.fromPairs(testAreaTypes.map(({ id, name }) => [id, name])),
      },
      {
        title: '区域类型',
        dataIndex: 'test_area_type',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '区域描述',
        dataIndex: 'description',
        hideInSearch: true,
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
                  await openTestAreaEditor(record.id)
                  tableActionRef.current?.reload()
                }}
              >
                编辑
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(`/api/v1/test_areas/${record.id}`)
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
    [tableActionRef, testAreaTypes],
  )

  return (
    <PageContainer>
      <ProTable<ITestArea>
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...params }) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: ITestArea[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get('/api/v1/test_areas', {
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
                    `/api/v1/test_areas/${selectedRowKeys.join(',')}`,
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
                await openTestAreaEditor()
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

export default List
