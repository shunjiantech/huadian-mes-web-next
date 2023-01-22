import { PlusOutlined } from '@ant-design/icons'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  FormDialog,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Select,
} from '@formily/antd'
import { createSchemaField, ISchema } from '@formily/react'
import { Button, message, Popconfirm, Space, Typography } from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import getTestLimitFieldsState from '@/store/getTestLimitFieldsState'
import getTestLimitState from '@/store/getTestLimitState'
import { numberParser } from '@/utils/antdUtils'
import request from '@/utils/request'

interface ILimitItem {
  id?: number | string
  device_category_id?: number | string
  device_category_name?: string
  description?: string
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    NumberPicker,
    Select,
  },
})

const openTestLimitItemEditor = (
  schema: ISchema,
  paramsId?: number | string,
  id?: number | string,
) => {
  const dialog = FormDialog(id ? '编辑' : '新增', () => (
    <FormLayout labelCol={5} wrapperCol={19}>
      <SchemaField
        schema={schema}
        scope={{
          numberParser,
        }}
      />
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
            data: ILimitItem
          }>
        > = await request.get(`/api/v1/test_limits/${paramsId}/items/${id}`)
        if (response.data.code !== 0) {
          throw new Error(response.data.message ?? '')
        }
        const rawData = _.cloneDeep(response.data.data ?? {})
        const outsideKeys = [
          'id',
          'device_category_id',
          'device_category_name',
          'description',
        ]
        let data = {
          ..._.pick(rawData, outsideKeys),
          values: _.omit(rawData, outsideKeys),
        }
        {
          // data transform
          data = {
            ...data,
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
    let data = _.cloneDeep<ILimitItem>(payload.values)
    {
      // data transform
      data = {
        ...data,
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/test_limits/${paramsId}/items/${id}`, data)
      } else {
        await request.post(`/api/v1/test_limits/${paramsId}/items`, data)
      }
    } catch (err) {
      message.error((err as Error).message)
      return Promise.reject(err)
    }
    return next()
  })
  return dialog.open()
}

const ItemList = () => {
  const params = useParams()

  const tableActionRef = useRef<ActionType>()

  const [tableSelectedRowKeys, setTableSelectedRowKeys] = useState<
    (number | string)[]
  >([])

  const testLimit = useRecoilValue(getTestLimitState(params.id ?? '0'))
  const testLimitFields = useRecoilValue(
    getTestLimitFieldsState(params.id ?? '0'),
  )

  const schema = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ret: any = {
      type: 'object',
      properties: {
        device_category_id: {
          type: 'number',
          title: '产品种类',
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
          enum:
            testLimit.device_categories?.map(({ id, name }) => ({
              label: name,
              value: id,
            })) ?? [],
        },
        values: {
          type: 'object',
          properties: {},
        },
      },
    }
    const values = ret.properties.values.properties
    testLimitFields.forEach((field) => {
      if (field?.code) {
        switch (field.type) {
          case 'int':
            values[field.code] = {
              type: 'number',
              title: field.name,
              'x-decorator': 'FormItem',
              'x-component': 'NumberPicker',
              'x-component-props': {
                placeholder: '请输入',
                parser: '{{numberParser.int}}',
              },
            }
            break
          case 'float':
            values[field.code] = {
              type: 'number',
              title: field.name,
              'x-decorator': 'FormItem',
              'x-component': 'NumberPicker',
              'x-component-props': {
                placeholder: '请输入',
                step: 0.01,
                parser: '{{numberParser.float}}',
              },
            }
            break
          case 'enum':
            values[field.code] = {
              type: 'string',
              title: field.name,
              'x-decorator': 'FormItem',
              'x-component': 'Select',
              'x-component-props': {
                placeholder: '请选择',
              },
              enum:
                field.options?.map((item) => ({
                  label: item.name,
                  value: item.id,
                })) ?? [],
            }
            break
          default:
            values[field.code] = {
              type: 'string',
              title: field.name,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入',
              },
            }
            break
        }
      }
    })
    return ret
  }, [testLimit, testLimitFields])

  const columns = useMemo<ProColumns<ILimitItem>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '产品种类',
        dataIndex: 'device_category_name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      ...testLimitFields.map((item) => {
        const ret: ProColumns<ILimitItem> = {
          title: item.name,
          dataIndex: item.code,
          render: (dom) => <div className="min-w-14">{dom}</div>,
        }
        if (item.type === 'enum' && item.options) {
          ret.valueEnum = _.fromPairs(
            item.options.map(({ id, name }) => [id, name]),
          )
        }
        return ret
      }),
      {
        title: '操作',
        key: 'option',
        valueType: 'option',
        render: (dom, record) => (
          <div className="min-w-16">
            <Space size={['small', 0]} wrap>
              <Typography.Link
                onClick={async () => {
                  await openTestLimitItemEditor(schema, params.id, record.id)
                  tableActionRef.current?.reload()
                }}
              >
                编辑
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(
                    `/api/v1/test_limits/${params.id}/items/${record.id}`,
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
    [tableActionRef, testLimitFields],
  )

  return (
    <>
      <ProTable<ILimitItem>
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...otherParams }) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: ILimitItem[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get(`/api/v1/test_limits/${params.id}/items`, {
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
                    `/api/v1/test_limits/${
                      params.id
                    }/items/${selectedRowKeys.join(',')}`,
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
                await openTestLimitItemEditor(schema, params.id)
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

export default ItemList
