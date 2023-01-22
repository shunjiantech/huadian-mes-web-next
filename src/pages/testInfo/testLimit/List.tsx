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
import { FormInstance, message, Space, Tree, Typography } from 'antd'
import { DataNode as AntdTreeDataNode } from 'antd/es/tree'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import queryString from 'query-string'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import productTypesState from '@/store/productTypesState'
import { filterTreeNodeTitle } from '@/utils/antdUtils'
import { isBigIntStr } from '@/utils/bigintString'
import request from '@/utils/request'
import { useSyncDataSource } from '@/utils/useDataSource'

export interface ITestLimit {
  id?: number | string
  name?: string
  device_categories?: { id: number | string; name: string }[]
  device_category_ids?: (number | string)[]
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
      title: '限值名称',
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
      'x-reactions': ['{{useSyncDataSource(productTypesTreeData)}}'],
    },
  },
}

const openTestLimitEditor = (id?: number | string) => {
  const dialog = FormDialog(id ? '编辑' : '新增', () => {
    const productTypes = useRecoilValue(productTypesState)
    const productTypesTreeData = useMemo(() => {
      return productTypes.map(({ id, name, children }) => ({
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
    }, [productTypes])

    return (
      <FormLayout labelCol={5} wrapperCol={19}>
        <SchemaField
          schema={schema}
          scope={{
            useSyncDataSource,
            productTypesTreeData,
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
            data: ITestLimit
          }>
        > = await request.get(`/api/v1/test_limits/${id}`)
        if (response.data.code !== 0) {
          throw new Error(response.data.message ?? '')
        }
        let data = _.cloneDeep(response.data.data ?? {})
        {
          // data transform
          data = {
            ...data,
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
    let data = _.cloneDeep<ITestLimit>(payload.values)
    {
      // data transform
      data = {
        ...data,
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/test_limits/${id}`, data)
      } else {
        await request.post('/api/v1/test_limits', data)
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

  const columns = useMemo<ProColumns<ITestLimit>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '限值名称',
        dataIndex: 'name',
        render: (dom, record) => (
          <div className="min-w-14">
            <Link to={`../${record.id}`}>{record.name}</Link>
          </div>
        ),
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
                  if (record.id) {
                    await openTestLimitEditor(record.id)
                    tableActionRef.current?.reload()
                  }
                }}
              >
                编辑
              </Typography.Link>
              {/* <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(`/api/v1/test_limits/${record.id}`)
                  tableActionRef.current?.reload()
                }}
              >
                <Typography.Link>删除</Typography.Link>
              </Popconfirm> */}
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
            filterTreeNode={filterTreeNodeTitle}
          />
        ),
      },
    ],
    [tableActionRef, productTypes],
  )

  return (
    <PageContainer>
      <ProTable<ITestLimit>
        formRef={tableFormRef}
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...params }) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: ITestLimit[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get('/api/v1/test_limits', {
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
        tableAlertOptionRender={() => {
          return (
            <Space>
              {/* <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(
                    `/api/v1/test_limits/${selectedRowKeys.join(',')}`,
                  )
                  tableActionRef.current?.reload()
                }}
              >
                <Typography.Link disabled={selectedRowKeys.length === 0}>
                  批量删除
                </Typography.Link>
              </Popconfirm> */}
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
          // actions: [
          //   <Button
          //     key="new"
          //     type="primary"
          //     icon={<PlusOutlined />}
          //     onClick={async () => {
          //       await openTestLimitEditor()
          //       tableActionRef.current?.reload()
          //     }}
          //   >
          //     新增
          //   </Button>,
          // ],
        }}
        options={false}
        pagination={false}
      />
      <FormDialog.Portal />
    </PageContainer>
  )
}

export default List
