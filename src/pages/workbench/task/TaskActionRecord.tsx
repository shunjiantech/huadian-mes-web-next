import { SearchOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { message, Popover, Space, Tag, Typography } from 'antd'
import { AxiosResponse } from 'axios'
import { useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { ITestItem } from '@/pages/testInfo/testItem/List'
import userInfoState from '@/store/userInfoState'
import request from '@/utils/request'

interface IActionRecord {
  device_id?: number | string
  device_name?: string
  device_category_id?: number | string
  device_category_name?: string
  qrcode?: string
  operator?: string
  operator_id?: number | string
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

export const taskTypeColors = {
  1: 'cyan',
  2: 'purple',
  3: 'pink',
  4: 'pink',
  5: 'pink',
  6: 'blue',
}

export const taskTypeNames = {
  1: '调度',
  2: '试验',
  3: '一级审批',
  4: '二级审批',
  5: '三级审批',
  6: '签收',
}

const TaskActionRecord = () => {
  const params = useParams()

  const userInfo = useRecoilValue(userInfoState)

  const tableActionRef = useRef<ActionType>()

  const columns = useMemo<ProColumns<IActionRecord>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
      },
      {
        title: '操作时间',
        dataIndex: 'operate_time',
        valueType: 'dateTime',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '操作内容',
        dataIndex: 'task_type',
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
                    : record.task_type === 2
                    ? record.task
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
                {([1].includes(record.task_type) ||
                  record.task?.includes('开始试验')) &&
                  (record.test_user_name ||
                    record.secondary_test_user_name) && (
                    <>
                      {record.test_user_name && (
                        <Tag>试验人员: {record.test_user_name}</Tag>
                      )}
                      {record.secondary_test_user_name && (
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
        title: '操作人',
        dataIndex: 'operator',
        render: (dom, record) => (
          <div className="min-w-14">
            <Space>
              {record.operator}
              {record.operator_id === userInfo.id && (
                <Tag color="warning">我</Tag>
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
      <ProTable<IActionRecord>
        actionRef={tableActionRef}
        request={async () => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: IActionRecord[]
              }>
            > = await request.get('/api/v1/tasks/history', {
              params: {
                device_id: params.device_id,
              },
            })
            if (response.data.code !== 0) {
              throw new Error(response.data.message ?? '')
            }
            const list = response.data.data ?? []
            return {
              data: list.map((item, _index) => ({ ...item, _index })),
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
        rowKey="_index"
        search={false}
        toolbar={{
          title: '数据列表',
        }}
        options={false}
        pagination={false}
      />
    </PageContainer>
  )
}

export default TaskActionRecord
