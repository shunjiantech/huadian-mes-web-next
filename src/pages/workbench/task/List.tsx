import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  FormDialog,
  FormItem,
  FormLayout,
  Input,
  SelectTable,
} from '@formily/antd'
import { createSchemaField } from '@formily/react'
import {
  message,
  Popconfirm,
  Select,
  Space,
  Tag,
  TreeSelect,
  Typography,
} from 'antd'
import { AxiosResponse } from 'axios'
import _ from 'lodash-es'
import queryString from 'query-string'
import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import getTestStationUsersState from '@/store/getTestStationUsersState'
import productCategoriesState from '@/store/productCategoriesState'
import userInfoState from '@/store/userInfoState'
import { filterTreeNodeTitle } from '@/utils/antdUtils'
import request from '@/utils/request'

interface ITestItem {
  id?: number | string
  name?: string
  ename?: string
  children?: Omit<ITestItem, 'children'>[]
}

interface ITask {
  device_id?: number | string
  device_name?: string
  device_category_id?: number | string
  device_category_name?: string
  qrcode?: string
  task_status?: number
  completed_test_item_count?: number
  total_test_item_count?: number
  report_status?: number
  test_status?: number
  test_items?: ITestItem[]
  test_station_id?: number | string
  test_station?: string
}

const taskStatusEnum: Record<string, string> = {
  1: '待调度',
  2: '调度中',
  3: '待签收试验',
  4: '待开始试验',
  5: '试验中',
  6: '待审批（一级）',
  7: '审批中（一级）',
  8: '待审批（二级）',
  9: '审批中（二级）',
  10: '待审批（三级）',
  11: '审批中（三级）',
  12: '审批完成',
}

const taskStatusEnumOptions = Object.keys(taskStatusEnum).map((key) => {
  return {
    value: Number(key),
    label: taskStatusEnum[key],
  }
})

const getTaskStatusColor = (key: number | string = 0) => {
  const numKey = Number(key)
  return [1, 3, 4, 6, 8, 10].includes(numKey)
    ? 'orange'
    : [2, 5, 7, 9, 11].includes(numKey)
    ? 'blue'
    : 'green'
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    SelectTable,
  },
})

const startTestSchema = {
  type: 'object',
  properties: {
    qrcode: {
      type: 'string',
      title: '二维码编码',
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
    secondary_test_user_id: {
      type: 'string',
      title: '辅助试验人员',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'SelectTable',
      'x-component-props': {
        mode: 'single',
        primaryKey: 'id',
        pagination: false,
      },
      enum: '{{testStationUsers}}',
      properties: {
        name: {
          title: '用户名',
          type: 'string',
          'x-component': 'SelectTable.Column',
        },
        nick_name: {
          title: '昵称',
          type: 'string',
          'x-component': 'SelectTable.Column',
        },
      },
    },
  },
}

const openStartTestDialog = (
  device_id: number | string,
  test_station_id: number | string,
  device_category_id: number | string,
) => {
  const dialog = FormDialog('开始试验', () => {
    const testStationUsers = useRecoilValue(
      getTestStationUsersState(test_station_id, device_category_id),
    )
    const userInfo = useRecoilValue(userInfoState)
    return (
      <FormLayout labelCol={5} wrapperCol={19}>
        <SchemaField
          schema={startTestSchema}
          scope={{
            testStationUsers: testStationUsers.filter(
              ({ id }) => id !== userInfo.id,
            ),
          }}
        />
      </FormLayout>
    )
  })
  dialog.forConfirm(async (payload, next) => {
    let data = _.cloneDeep(payload.values)
    data = {
      device_id,
      ...data,
    }
    try {
      const response = await request.post('/api/v1/tasks/start_test', data)
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
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

  const columns = useMemo<ProColumns<ITask>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '产品名称',
        dataIndex: 'device_name',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '产品种类',
        dataIndex: 'device_category_id',
        hideInTable: true,
        renderFormItem: () => (
          <TreeSelect
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
        dataIndex: 'device_category_name',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '二维码编码',
        dataIndex: 'qrcode',
        render: (dom) => (
          <div className="min-w-14">
            <Typography.Text copyable>{dom}</Typography.Text>
          </div>
        ),
      },
      {
        title: '任务状态',
        key: 'task_status',
        renderFormItem: () => (
          <Select allowClear placeholder="请选择">
            {taskStatusEnumOptions.map(({ label, value }, index) => (
              <Select.Option value={value} key={index}>
                <div className="h-full flex items-center">
                  <Tag color={getTaskStatusColor(value)}>{label}</Tag>
                </div>
              </Select.Option>
            ))}
          </Select>
        ),
        render: (dom, record) => (
          <div className="min-w-14">
            <Tag color={getTaskStatusColor(record.task_status)}>
              {taskStatusEnum[record.task_status ?? 0]}
            </Tag>
          </div>
        ),
      },
      {
        title: '试验进度',
        key: 'tests',
        hideInSearch: true,
        render: (dom, record) => (
          <div className="min-w-14">
            <Link to={`../${record.device_id}/test-progress`}>
              查看({record.completed_test_item_count}/
              {record.total_test_item_count})
            </Link>
          </div>
        ),
      },
      {
        title: '历史流程',
        key: 'history',
        hideInSearch: true,
        render: (dom, record) => (
          <div className="min-w-14">
            <Link to={`../${record.device_id}/action-record`}>查看</Link>
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
              {record.task_status === 1 && (
                <Typography.Link
                  onClick={() => {
                    console.log(record.device_id)
                  }}
                >
                  签收(调度)
                </Typography.Link>
              )}
              {record.task_status === 2 && (
                <>
                  {/* 试验进度未达到 100% 时显示 */}
                  {record.completed_test_item_count !==
                    record.total_test_item_count && (
                    <Typography.Link>调度(试验)</Typography.Link>
                  )}
                  <Popconfirm
                    title={`${
                      record.completed_test_item_count !==
                      record.total_test_item_count
                        ? '还有试验未完成，'
                        : ''
                    }确定调度到审批池中吗？`}
                  >
                    <Typography.Link>调度(审批)</Typography.Link>
                  </Popconfirm>
                  <Popconfirm title="退回到调度池中？">
                    <Typography.Link>退回</Typography.Link>
                  </Popconfirm>
                </>
              )}
              {record.task_status === 3 && (
                <Typography.Link>签收(试验)</Typography.Link>
              )}
              {record.task_status === 4 && (
                <>
                  <Typography.Link
                    onClick={async () => {
                      if (
                        record.device_id &&
                        record.test_station_id &&
                        record.device_category_id
                      ) {
                        await openStartTestDialog(
                          record.device_id,
                          record.test_station_id,
                          record.device_category_id,
                        )
                        tableActionRef.current?.reload()
                      }
                    }}
                  >
                    开始试验
                  </Typography.Link>
                  <Popconfirm title="退回到调度池中？">
                    <Typography.Link>退回</Typography.Link>
                  </Popconfirm>
                </>
              )}
              {record.task_status === 5 && (
                <>
                  <Link
                    to={{
                      pathname: `../${record.device_id}/test`,
                      search: queryString.stringify({
                        items: JSON.stringify(
                          record.test_items?.map(({ id, name, children }) => ({
                            id,
                            name,
                            children: children?.map(({ id, name }) => ({
                              id,
                              name,
                            })),
                          })),
                        ),
                        test_station_id: record.test_station_id,
                      }),
                    }}
                  >
                    继续试验
                  </Link>
                  {record.test_status ? (
                    <Typography.Link>完成试验</Typography.Link>
                  ) : (
                    <Popconfirm title="退回到调度池中？">
                      <Typography.Link>退回</Typography.Link>
                    </Popconfirm>
                  )}
                </>
              )}
              {record.task_status === 6 && (
                <Typography.Link>签收(一级审批)</Typography.Link>
              )}
              {record.task_status === 7 && (
                <>
                  {record.report_status === 1 ? (
                    <Typography.Link>生成报告</Typography.Link>
                  ) : (
                    <Typography.Link>报告预览</Typography.Link>
                  )}
                  <Typography.Link>一级审批</Typography.Link>
                  <Popconfirm title="退回到调度池中？">
                    <Typography.Link>退回</Typography.Link>
                  </Popconfirm>
                </>
              )}
              {record.task_status === 8 && (
                <Typography.Link>签收(二级审批)</Typography.Link>
              )}
              {record.task_status === 9 && (
                <>
                  <Typography.Link>报告预览</Typography.Link>
                  <Typography.Link>二级审批</Typography.Link>
                  <Popconfirm title="退回到调度池中？">
                    <Typography.Link>退回</Typography.Link>
                  </Popconfirm>
                </>
              )}
              {record.task_status === 10 && (
                <Typography.Link>签收(三级审批)</Typography.Link>
              )}
              {record.task_status === 11 && (
                <>
                  <Typography.Link>报告预览</Typography.Link>
                  <Typography.Link>三级审批</Typography.Link>
                  <Popconfirm title="退回到调度池中？">
                    <Typography.Link>退回</Typography.Link>
                  </Popconfirm>
                </>
              )}
            </Space>
          </div>
        ),
      },
    ],
    [tableActionRef],
  )

  return (
    <PageContainer>
      <ProTable<ITask>
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...params }) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: ITask[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get('/api/v1/tasks', {
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
        rowKey="device_id"
        toolbar={{
          title: '数据列表',
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
