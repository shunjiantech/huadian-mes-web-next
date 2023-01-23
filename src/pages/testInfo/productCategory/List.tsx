import { EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { FormDialog, FormItem, FormLayout, Input, Select } from '@formily/antd'
import { createSchemaField } from '@formily/react'
import {
  Button,
  Image,
  message,
  Popconfirm,
  Select as AntdSelect,
  Space,
  Tag,
  Typography,
} from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useMemo, useRef } from 'react'
import { useRecoilValue } from 'recoil'

import CardUpload from '@/components/CardUpload'
// import config from '@/config'
import departmentsState from '@/store/departmentsState'
import extraParamTypesState from '@/store/extraParamTypesState'
import productTypesState from '@/store/productTypesState'
// import { getFullApiURL } from '@/utils/getURL'
import request from '@/utils/request'
import * as uploadFieldConversion from '@/utils/uploadFieldConversion'
import { useSyncDataSource } from '@/utils/useDataSource'

interface IProductCategory {
  pid?: number | string
  id?: number | string
  name?: string
  code?: string
  device_category_type_id?: number | string
  device_category_type?: string
  dept_id?: number | string
  dept?: string
  extra_param_type_code?: string
  description?: string
  pic_arr?: unknown[]
  pic1?: unknown
  pic1_url?: string
  pic2?: unknown
  pic2_url?: string
  children?: IProductCategory[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ExtraParamTypeSelect = (props: any) => {
  const extraParamTypes = useRecoilValue(extraParamTypesState)

  return (
    <AntdSelect {...props}>
      {extraParamTypes.map((item, index) => (
        <AntdSelect.Option value={item.code} key={index}>
          <div className="h-full flex items-center">
            <Tag>{item.code}</Tag>
            {item.name}
          </div>
        </AntdSelect.Option>
      ))}
    </AntdSelect>
  )
}

const SchemaField = createSchemaField({
  components: {
    CardUpload,
    ExtraParamTypeSelect,
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
      title: '种类名称',
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
    code: {
      type: 'string',
      title: '种类编码',
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
    device_category_type_id: {
      type: 'string',
      title: '种类类型',
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
        allowClear: true,
      },
      'x-reactions': ['{{useSyncDataSource(productTypesSelectData)}}'],
    },
    dept_id: {
      type: 'string',
      title: '部门',
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
        allowClear: true,
      },
      'x-reactions': ['{{useSyncDataSource(departmentsTreeData)}}'],
    },
    extra_param_type_code: {
      type: 'string',
      title: '额外参数',
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'ExtraParamTypeSelect',
      'x-component-props': {
        placeholder: '请选择',
        allowClear: true,
      },
    },
    description: {
      type: 'string',
      title: '描述',
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Input.TextArea',
      'x-component-props': {
        placeholder: '请输入',
        allowClear: true,
      },
    },
    pic_arr: {
      type: 'array',
      title: '图片',
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'CardUpload',
      'x-component-props': {
        accept: 'image/*',
        maxCount: 2,
        data: {
          type: 3,
        },
      },
    },
  },
}

const productCategoryUploadFieldKeys: uploadFieldConversion.Key[] = [
  { key: 'pic1', onlyOneFlat: true },
  { key: 'pic2', onlyOneFlat: true },
]

const openProductCategoryEditor = (
  id?: number | string,
  parent?: IProductCategory,
) => {
  const dialog = FormDialog(
    id ? '编辑' : parent ? `${parent.name} - 新增子类` : '新增',
    () => {
      const productTypes = useRecoilValue(productTypesState)
      const productTypesSelectData = useMemo(() => {
        return productTypes.map((item) => ({
          label: item.name,
          value: item.id,
        }))
      }, [productTypes])
      const departments = useRecoilValue(departmentsState)
      const departmentsTreeData = useMemo(() => {
        return departments.map(({ id, name, children }) => ({
          label: name,
          title: name,
          value: id,
          selectable: false,
          isLeaf: false,
          children: children?.map(({ id, name }) => ({
            label: name,
            title: name,
            value: id,
            selectable: true,
            isLeaf: true,
          })),
        }))
      }, [departments])

      return (
        <FormLayout labelCol={5} wrapperCol={19}>
          <SchemaField
            schema={schema}
            scope={{
              useSyncDataSource,
              productTypesSelectData,
              departmentsTreeData,
            }}
          />
        </FormLayout>
      )
    },
  )
  if (id) {
    dialog.forOpen(async (payload, next) => {
      let initialValues
      try {
        const response: AxiosResponse<
          Partial<{
            code: number
            message: string
            data: IProductCategory
          }>
        > = await request.get(`/api/v1/device_categories/${id}`)
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
          uploadFieldConversion.pathsToFiles(
            data,
            productCategoryUploadFieldKeys,
          )
          data.pic_arr = [
            ...(data.pic1 as unknown as string[]),
            ...(data.pic2 as unknown as string[]),
          ]
        }
        initialValues = data
      } catch (err) {
        message.error((err as Error).message)
      }
      next({ initialValues })
    })
  }
  dialog.forConfirm(async (payload, next) => {
    const data = _.cloneDeep<IProductCategory>(payload.values)
    {
      // data transform
      if (!id && parent) {
        data.pid = parent.id
      }
      data.pic1 = data.pic_arr?.[0] ? [data.pic_arr[0]] : []
      data.pic2 = data.pic_arr?.[1] ? [data.pic_arr[1]] : []
      data.pic_arr = undefined
      uploadFieldConversion.filesToPaths(data, productCategoryUploadFieldKeys)
      uploadFieldConversion.removeUrlField(data, productCategoryUploadFieldKeys)
    }
    try {
      if (id) {
        await request.put(`/api/v1/device_categories/${id}`, data)
      } else {
        await request.post('/api/v1/device_categories', data)
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

  const productTypes = useRecoilValue(productTypesState)
  const extraParamTypes = useRecoilValue(extraParamTypesState)

  const columns = useMemo<ProColumns<IProductCategory>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 76,
      },
      {
        title: '种类名称',
        dataIndex: 'name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '种类编码',
        dataIndex: 'code',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '种类类型',
        dataIndex: 'device_category_type_id',
        hideInTable: true,
        valueEnum: _.fromPairs(productTypes.map(({ id, name }) => [id, name])),
      },
      {
        title: '种类类型',
        dataIndex: 'device_category_type',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '部门',
        dataIndex: 'dept',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '额外参数',
        dataIndex: 'extra_param_type_code',
        hideInSearch: true,
        render: (dom, record) => (
          <div className="min-w-14">
            {dom && (
              <>
                <Tag>{dom}</Tag>
                {
                  extraParamTypes.find(
                    ({ code }) => code === record.extra_param_type_code,
                  )?.name
                }
              </>
            )}
          </div>
        ),
      },
      {
        title: '描述',
        dataIndex: 'description',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '图片',
        key: 'pic',
        hideInSearch: true,
        render: (dom, record) => (
          <div className="min-w-14">
            <Space>
              {record.pic1_url && (
                <Image
                  src={record.pic1_url}
                  width={32}
                  height={32}
                  preview={{
                    mask: <EyeOutlined />,
                  }}
                />
              )}
              {record.pic2_url && (
                <Image
                  src={record.pic2_url}
                  width={32}
                  height={32}
                  preview={{
                    mask: <EyeOutlined />,
                  }}
                />
              )}
            </Space>
          </div>
        ),
      },
      {
        title: '操作',
        key: 'option',
        valueType: 'option',
        render: (dom, record) => (
          <div className="min-w-36">
            <Space size={['small', 0]} wrap>
              <Typography.Link
                disabled={!!record.pid}
                onClick={async () => {
                  await openProductCategoryEditor(undefined, record)
                  tableActionRef.current?.reload()
                }}
              >
                新增子类
              </Typography.Link>
              <Typography.Link
                onClick={async () => {
                  await openProductCategoryEditor(record.id)
                  tableActionRef.current?.reload()
                }}
              >
                编辑
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(`/api/v1/device_categories/${record.id}`)
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
    [tableActionRef, productTypes, extraParamTypes],
  )

  return (
    <PageContainer>
      <ProTable<IProductCategory>
        actionRef={tableActionRef}
        request={async (params) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: IProductCategory[]
              }>
            > = await request.get('/api/v1/device_categories/tree', {
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
                await openProductCategoryEditor()
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
