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
  FormInstance,
  message,
  Popconfirm,
  Space,
  Tree,
  Typography,
} from 'antd'
import { DataNode as AntdTreeDataNode } from 'antd/es/tree'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import queryString from 'query-string'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import productTypesState from '@/store/productTypesState'
import testItemTypesState from '@/store/testItemTypesState'
import { isBigIntStr } from '@/utils/bigintString'
import request from '@/utils/request'
import { useSyncDataSource } from '@/utils/useDataSource'

interface ITestItem {
  pid?: number | string
  id?: number | string
  name?: string
  display_name?: string
  content?: string
  test_item_type?: string
  test_item_type_id?: number | string
  device_categories?: { id: number | string; name: string }[]
  device_category_id?: number | string
  device_category_ids?: (number | string)[]
  code?: string
  ename?: string
  description?: string
  children?: ITestItem[]
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    TreeSelect,
  },
})

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '试验名称',
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
    display_name: {
      type: 'string',
      title: '显示名称',
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
    content: {
      type: 'string',
      title: '试验内容',
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
    test_item_type_id: {
      type: 'string',
      title: '试验类型',
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
      'x-reactions': ['{{useSyncDataSource(testItemTypesData)}}'],
    },
    device_category_ids: {
      type: 'string',
      title: '产品种类',
      required: true,
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
      },
      'x-reactions': ['{{useSyncDataSource(productTypesTreeData)}}'],
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
      },
    },
  },
}

const openTestItemEditor = (id?: number | string, parent?: ITestItem) => {
  const dialog = FormDialog(
    id ? '编辑' : parent ? `${parent.name} - 新增子项` : '新增',
    () => {
      const testItemTypes = useRecoilValue(testItemTypesState)
      const testItemTypesData = useMemo(() => {
        return testItemTypes.map(({ id, name }) => {
          return {
            label: name,
            value: id,
          }
        })
      }, [testItemTypes])

      const productTypes = useRecoilValue(productTypesState)
      const productTypesTreeData = useMemo(() => {
        return productTypes.map(({ id, name, children }) => ({
          label: name,
          value: id,
          selectable: false,
          isLeaf: false,
          children: children?.map(({ id, name }) => ({
            label: name,
            value: id,
            selectable: true,
            isLeaf: true,
          })),
        }))
      }, [productTypes])

      return (
        <FormLayout labelCol={5} wrapperCol={19}>
          <SchemaField
            schema={schema}
            scope={{
              useSyncDataSource,
              productTypesTreeData,
              testItemTypesData,
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
            data: ITestItem
          }>
        > = await request.get(`/api/v1/test_items/${id}`)
        if (response.data.code !== 0) {
          throw new Error(response.data.message ?? '')
        }
        let data = _.cloneDeep(response.data.data ?? {})
        {
          // data transform
          data = {
            ...data,
            id: undefined,
            test_item_type: undefined,
            device_categories: undefined,
            device_category_ids: data.device_categories?.map(({ id }) => id),
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
    const data = _.cloneDeep<ITestItem>(payload.values)
    {
      // data transform
      if (!id && parent) {
        data.pid = parent.id
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/test_items/${id}`, data)
      } else {
        await request.post('/api/v1/test_items', data)
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
  const location = useLocation()

  const [selectedProductType, setSelectedProductType] = useState<
    string | number | undefined
  >()

  useEffect(() => {
    // sync: url to selectedProductType
    const queryProductType = queryString.parse(
      location.search,
    ).device_category_id
    if (typeof queryProductType === 'string') {
      if (isBigIntStr(queryProductType)) {
        setSelectedProductType(queryProductType)
      } else if (
        !isNaN(Number(queryProductType)) &&
        `${Number(queryProductType)}` === queryProductType
      ) {
        setSelectedProductType(Number(queryProductType))
      } else {
        setSelectedProductType('all')
      }
    } else {
      setSelectedProductType('all')
    }
  }, [])

  const tableFormRef = useRef<FormInstance>()
  const tableActionRef = useRef<ActionType>()

  const testItemTypes = useRecoilValue(testItemTypesState)

  const productTypes = useRecoilValue(productTypesState)
  const productTypesTreeData = useMemo<AntdTreeDataNode[]>(() => {
    return [
      {
        key: 'all',
        title: '全部',
      },
      ...productTypes.map(({ id, name, children }) => ({
        key: id,
        title: name,
        selectable: false,
        isLeaf: false,
        children: children?.map(({ id, name }) => ({
          key: id,
          title: name,
          selectable: true,
          isLeaf: true,
        })),
      })),
    ]
  }, [productTypes])

  const [tableSelectedRowKeys, setTableSelectedRowKeys] = useState<
    (number | string)[]
  >([])

  const columns = useMemo<ProColumns<ITestItem>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 76,
      },
      {
        title: '试验名称',
        dataIndex: 'name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '英文名称',
        dataIndex: 'ename',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '显示名称',
        dataIndex: 'display_name',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '试验内容',
        dataIndex: 'content',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '试验类型',
        dataIndex: 'test_item_type_id',
        valueType: 'select',
        hideInTable: true,
        valueEnum: _.fromPairs(testItemTypes.map(({ id, name }) => [id, name])),
      },
      {
        title: '试验类型',
        dataIndex: 'test_item_type',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '描述',
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
                disabled={!!record.pid}
                onClick={async () => {
                  await openTestItemEditor(undefined, record)
                  tableActionRef.current?.reload()
                }}
              >
                新增子项
              </Typography.Link>
              <Typography.Link
                onClick={async () => {
                  await openTestItemEditor(record.id)
                  tableActionRef.current?.reload()
                }}
              >
                编辑
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(`/api/v1/test_items/${record.id}`)
                  tableActionRef.current?.reload()
                }}
              >
                <Typography.Link>删除</Typography.Link>
              </Popconfirm>
            </Space>
          </div>
        ),
      },
      {
        title: '产品种类',
        dataIndex: 'device_category_id',
        hideInTable: true,
        renderFormItem: () => (
          <TreeSelect
            treeData={[
              ...productTypes.map(({ id, name, children }) => ({
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
          />
        ),
      },
    ],
    [tableActionRef, testItemTypes, productTypes],
  )

  return (
    <PageContainer>
      <ProTable<ITestItem>
        formRef={tableFormRef}
        actionRef={tableActionRef}
        request={async (params) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: ITestItem[]
              }>
            > = await request.get('/api/v1/test_items/tree', {
              params,
            })
            if (response.data.code !== 0) {
              throw new Error(response.data.message ?? '')
            }
            const list = response.data.data ?? []
            setTableSelectedRowKeys((tableSelectedRowKeys) => {
              return tableSelectedRowKeys.filter((key) => {
                return list.find(({ id }) => id === key)
              })
            })
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
          syncToUrl: (values, type) => {
            {
              // sync to selectedProductType
              if (type === 'set') {
                setSelectedProductType(values.device_category_id ?? 'all')
              }
            }
            return values
          },
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
                    `/api/v1/test_items/${selectedRowKeys.join(',')}`,
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
        tableRender={(props, dom) => {
          return (
            <div className="flex">
              <div className="flex-none w-240px mr-4 pt-1 bg-white rounded overflow-hidden">
                <Tree.DirectoryTree
                  selectedKeys={
                    selectedProductType ? [selectedProductType] : []
                  }
                  treeData={productTypesTreeData}
                  defaultExpandAll
                  icon={null}
                  onSelect={([selectedKey]) => {
                    tableFormRef.current?.setFieldValue(
                      'device_category_id',
                      selectedKey === 'all' ? undefined : selectedKey,
                    )
                    tableFormRef.current?.submit()
                  }}
                />
              </div>
              <div className="flex-auto">{dom}</div>
            </div>
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
                await openTestItemEditor()
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
