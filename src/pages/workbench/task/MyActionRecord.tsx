import { SearchOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { message, Popover, Space, Tag, TreeSelect, Typography } from 'antd'
import { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import { useMemo, useRef } from 'react'
import { useRecoilValue } from 'recoil'

import { ITestItem } from '@/pages/testInfo/testItem/List'
import {
  taskTypeColors,
  taskTypeNames,
} from '@/pages/workbench/task/TaskActionRecord'
import productTypesState from '@/store/productTypesState'
import { filterTreeNodeTitle } from '@/utils/antdUtils'
import request from '@/utils/request'

interface IActionRecord {
  device_id?: number | string
  device_name?: string
  device_category_id?: number | string
  device_category_name?: string
  qrcode?: string
  start_operate_time?: number
  end_operate_time?: number
  operate_time?: number
  task?: string
  task_type?: 1 | 2 | 3 | 4 | 5 | 6 // 任务类型：1：调度，2：试验，3：一级审批，4：二级审批，5：三级审批，6：签收
  is_canceled?: 0 | 1 // 是否退回：0：否，1：是
  test_user_name?: string
  secondary_test_user_name?: string
  approval_record_result?: 0 | 1 // 审批结果：0：驳回，1：通过，任务类型3,4,5时必须
  approval_record_content?: string // 审批内容：任务类型3,4,5时必须
  test_items?: ITestItem[]
}

const MyActionRecord = () => {
  const tableActionRef = useRef<ActionType>()

  const productTypes = useRecoilValue(productTypesState)

  const columns = useMemo<ProColumns<IActionRecord>[]>(
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
        title: '操作内容',
        dataIndex: 'task_type',
        hideInSearch: true,
        render: (dom, record) => (
          <div className="min-w-14">
            {record.task_type && (
              <>
                <Tag
                  color={record.task_type && taskTypeColors[record.task_type]}
                >
                  {record.task_type === 1
                    ? record.is_canceled === 1
                      ? '调度'
                      : record.test_user_name
                      ? '调度 → 试验'
                      : '调度 → 审批'
                    : taskTypeNames[record.task_type]}
                </Tag>
                {record.is_canceled === 1 ? (
                  <Tag color="error">退回</Tag>
                ) : (
                  [3, 4, 5].includes(record.task_type) &&
                  record.approval_record_result && (
                    <Tag
                      color={
                        ['error', 'success'][record.approval_record_result]
                      }
                    >
                      审批结果({['驳回', '通过'][record.approval_record_result]}
                      ): {record.approval_record_content}
                    </Tag>
                  )
                )}
                {[1, 2].includes(record.task_type) &&
                  (record.test_user_name ||
                    record.secondary_test_user_name) && (
                    <>
                      {[1, 2].includes(record.task_type) &&
                        record.test_user_name && (
                          <Tag>试验人员: {record.test_user_name}</Tag>
                        )}
                      {[2].includes(record.task_type) &&
                        record.secondary_test_user_name && (
                          <Tag>
                            辅助试验人员: {record.secondary_test_user_name}
                          </Tag>
                        )}
                      <Popover
                        title="试验列表"
                        trigger="click"
                        content={
                          <Space direction="vertical">
                            {record.test_items?.map((test_item, index) => (
                              <Tag key={index}>{test_item.name}</Tag>
                            ))}
                          </Space>
                        }
                      >
                        <Typography.Link>
                          <SearchOutlined /> 试验列表
                        </Typography.Link>
                      </Popover>
                    </>
                  )}
              </>
            )}
          </div>
        ),
      },
      {
        title: '操作时间',
        dataIndex: 'operate_time',
        valueType: 'dateRange',
        search: {
          transform: (value) =>
            typeof value?.[1] === 'string'
              ? {
                  start_operate_time: value[0],
                  end_operate_time: value[1],
                }
              : {},
        },
        hideInTable: true,
      },
      {
        title: '操作时间',
        dataIndex: 'operate_time',
        valueType: 'dateTime',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
    ],
    [tableActionRef],
  )

  return (
    <PageContainer>
      <ProTable<IActionRecord>
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...params }) => {
          try {
            // data transform
            const requestParams: typeof params = {
              ...params,
              page: current,
              page_size: pageSize,
            }
            if (
              typeof requestParams.start_operate_time === 'string' &&
              typeof requestParams.end_operate_time === 'string'
            ) {
              requestParams.start_operate_time = dayjs(
                requestParams.start_operate_time,
              )
                .startOf('day')
                .valueOf()
              requestParams.end_operate_time = dayjs(
                requestParams.end_operate_time,
              )
                .endOf('day')
                .valueOf()
            }
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: IActionRecord[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get('/api/v1/my_tasks', {
              params: requestParams,
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
              data: list.map((item, _index) => ({ ...item, _index })),
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
          syncToUrl: (values, type) => {
            if (type === 'get') {
              return {
                ...values,
                start_operate_time: undefined,
                end_operate_time: undefined,
                operate_time:
                  values.start_operate_time && values.end_operate_time
                    ? [values.start_operate_time, values.end_operate_time]
                    : undefined,
              }
            }
            return values
          },
          syncToInitialValues: false,
        }}
        rowKey="_index"
        toolbar={{
          title: '数据列表',
        }}
        options={false}
        pagination={{
          size: 'default',
          defaultPageSize: 10,
        }}
      />
    </PageContainer>
  )
}

export default MyActionRecord
