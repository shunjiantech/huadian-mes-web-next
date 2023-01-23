import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  FormDialog,
  FormItem,
  FormLayout,
  Input,
  Select,
  TreeSelect,
} from '@formily/antd'
import { createSchemaField } from '@formily/react'
import {
  Button,
  message,
  Popconfirm,
  Select as AntdSelect,
  Space,
  Tag,
  TreeSelect as AntdTreeSelect,
  Typography,
} from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import { useMemo, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil'

import Upload from '@/components/Upload'
import productCategoriesState from '@/store/productCategoriesState'
import { filterTreeNodeTitle } from '@/utils/antdUtils'
import request from '@/utils/request'
import * as uploadFieldConversion from '@/utils/uploadFieldConversion'
import { useSyncDataSource } from '@/utils/useDataSource'

interface IPrintTemplate {
  id?: number | string
  name?: string
  type?: number // 模板类型：1：收样单，2：退样单，3：检测报告，4：设备使用记录
  path?: string
  device_category_id?: number | string
  device_category_ids?: (number | string)[] // 模板类型为3时选择
  device_categories?: {
    id?: number | string
    name?: string
  }[]
}

export const printTemplateTypeColors: Record<string, string> = {
  1: 'green',
  2: 'red',
  3: 'cyan',
  4: 'purple',
}

export const printTemplateTypeNames: Record<string, string> = {
  1: '收样单',
  2: '退样单',
  3: '检测报告',
  4: '设备使用记录',
}

export const printTemplateTypesEnumOptions = Object.keys(
  printTemplateTypeNames,
).map((key) => {
  return {
    value: Number(key),
    label: printTemplateTypeNames[key],
  }
})

export const getPrintTemplateTypeColor = (key: number | string = 0) => {
  const numKey = Number(key)
  return printTemplateTypeColors[numKey]
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    TreeSelect,
    Upload,
  },
})

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '模板名称',
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
      type: 'string',
      title: '模板类型',
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
      enum: '{{printTemplateTypesEnumOptions}}',
    },
    path: {
      type: 'array',
      title: '模板文件',
      required: true,
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Upload',
      'x-component-props': {
        accept:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        maxCount: 1,
        data: {
          type: 7,
        },
      },
    },
    device_category_ids: {
      type: 'string',
      title: '产品种类',
      'x-validator': [
        {
          whitespace: true,
        },
      ],
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        tooltip: '多选',
      },
      'x-component': 'TreeSelect',
      'x-component-props': {
        placeholder: '请选择',
        multiple: true,
        treeDefaultExpandAll: true,
        showSearch: true,
        filterTreeNode: '{{filterTreeNodeTitle}}',
      },
      'x-reactions': [
        '{{useSyncDataSource(productCategoriesTreeData)}}',
        {
          dependencies: ['type'],
          fulfill: {
            state: {
              display: '{{$deps[0] === 3 ? "visible" : "none"}}',
            },
          },
        },
      ],
    },
    description: {
      type: 'string',
      title: '描述',
      required: true,
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

const printTemplateUploadFieldKeys: uploadFieldConversion.Key[] = [
  { key: 'path', onlyOneFlat: true },
]

const openPrintTemplateEditor = (id?: number | string) => {
  const dialog = FormDialog(id ? '编辑' : '新增', () => {
    const productCategories = useRecoilValue(productCategoriesState)
    const productCategoriesTreeData = useMemo(() => {
      return productCategories.map(({ id, name, children }) => ({
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
    }, [productCategories])

    return (
      <FormLayout labelCol={5} wrapperCol={19}>
        <SchemaField
          schema={schema}
          scope={{
            useSyncDataSource,
            printTemplateTypesEnumOptions,
            productCategoriesTreeData,
            filterTreeNodeTitle,
          }}
        />
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
            data: IPrintTemplate
          }>
        > = await request.get(`/api/v1/templates/${id}`)
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
          uploadFieldConversion.pathsToFiles(data, printTemplateUploadFieldKeys)
        }
        initialValues = data
      } catch (err) {
        message.error((err as Error).message)
      }
      next({ initialValues })
    })
  }
  dialog.forConfirm(async (payload, next) => {
    let data = _.cloneDeep<IPrintTemplate>(payload.values)
    {
      // data transform
      data = {
        ...data,
      }
      uploadFieldConversion.filesToPaths(data, printTemplateUploadFieldKeys)
      uploadFieldConversion.removeUrlField(data, printTemplateUploadFieldKeys)
    }
    try {
      if (id) {
        await request.put(`/api/v1/templates/${id}`, data)
      } else {
        await request.post('/api/v1/templates', data)
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

  const productCategories = useRecoilValue(productCategoriesState)

  const [tableSelectedRowKeys, setTableSelectedRowKeys] = useState<
    (number | string)[]
  >([])

  const columns = useMemo<ProColumns<IPrintTemplate>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '模板名称',
        dataIndex: 'name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '模板类型',
        dataIndex: 'type',
        valueEnum: printTemplateTypeNames,
        renderFormItem: () => (
          <AntdSelect allowClear placeholder="请选择">
            {printTemplateTypesEnumOptions.map(({ label, value }, index) => (
              <AntdSelect.Option value={value} key={index}>
                <div className="h-full flex items-center">
                  <Tag color={getPrintTemplateTypeColor(value)}>{label}</Tag>
                </div>
              </AntdSelect.Option>
            ))}
          </AntdSelect>
        ),
        render: (dom, record) => (
          <div className="min-w-14">
            <Tag color={getPrintTemplateTypeColor(record.type)}>{dom}</Tag>
          </div>
        ),
      },
      {
        title: '模板路径',
        dataIndex: 'path',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '产品种类',
        dataIndex: 'device_category_id',
        hideInTable: true,
        renderFormItem: () => (
          <AntdTreeSelect
            treeData={[
              ...productCategories.map(({ id, name, children }) => ({
                key: id,
                value: id,
                title: name,
                selectable: false,
                isLeaf: false,
                children: children?.map(({ id, name }) => ({
                  key: id,
                  value: id,
                  title: name,
                  selectable: true,
                  isLeaf: true,
                })),
              })),
            ]}
            treeDefaultExpandAll
            allowClear
            showSearch
            placeholder="请选择"
            filterTreeNode={filterTreeNodeTitle}
          />
        ),
      },
      {
        title: '产品种类',
        dataIndex: 'device_categories',
        hideInSearch: true,
        render: (dom, record) => (
          <div className="min-w-14">
            {record.device_categories?.map(({ name }, index) => (
              <Tag key={index}>{name}</Tag>
            ))}
          </div>
        ),
      },
      {
        title: '备注',
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
                  await openPrintTemplateEditor(record.id)
                  tableActionRef.current?.reload()
                }}
              >
                编辑
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(`/api/v1/templates/${record.id}`)
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
      <ProTable<IPrintTemplate>
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...params }) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: IPrintTemplate[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get('/api/v1/templates', {
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
                    `/api/v1/templates/${selectedRowKeys.join(',')}`,
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
                await openPrintTemplateEditor()
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
