import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  DatePicker,
  FormDialog,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Radio,
  Select,
  TreeSelect,
} from '@formily/antd'
import { createSchemaField } from '@formily/react'
import {
  Button,
  message,
  Popconfirm,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import _ from 'lodash-es'
import { useMemo, useRef, useState } from 'react'
import { useRecoilValue } from 'recoil'

import testAreasState from '@/store/testAreasState'
import testInstrumentTypesState from '@/store/testInstrumentTypesState'
import testStationsState from '@/store/testStationsState'
import { filterTreeNodeTitle } from '@/utils/antdUtils'
import request from '@/utils/request'

interface ITestInstrument {
  id?: number | string
  name?: string
  code?: string
  model?: string
  instrument_type_id?: number | string
  instrument_type?: string
  test_station_id?: number | string
  test_station?: string
  keeper_id?: number | string
  keeper?: string
  manufacturer?: string
  serial_number?: string
  purchase_time?: number | string
  ip?: string
  port?: number
  correct_level?: string
  show_in_report?: 0 | 1 // 是否显示在报告中：0：不显示，1：显示
  last_ping_time?: number
  description?: string
  is_disabled?: 0 | 1 // 是否禁用（封存）：0：不禁用，1：禁用
}

export const showInReportNames: Record<string, string> = {
  0: '不显示',
  1: '显示',
}

export const showInReportColors: Record<string, string> = {
  0: 'red',
  1: 'green',
}

export const showInReportEnumOptions = Object.keys(showInReportNames).map(
  (key) => ({
    label: showInReportNames[key],
    value: Number(key),
  }),
)

export const isDisabledNames = {
  0: '激活',
  1: '锁定',
}

const SchemaField = createSchemaField({
  components: {
    DatePicker,
    FormItem,
    Input,
    NumberPicker,
    Radio,
    TreeSelect,
    Select,
  },
})

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '仪器名称',
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
    instrument_type_id: {
      type: 'string',
      title: '仪器类型',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择',
        allowClear: true,
      },
      enum: '{{testInstrumentTypesEnumOptions}}',
    },
    test_station_id: {
      type: 'string',
      title: '工位',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'TreeSelect',
      'x-component-props': {
        placeholder: '请选择',
        allowClear: true,
        treeDefaultExpandAll: true,
        showSearch: true,
        filterTreeNode: '{{filterTreeNodeTitle}}',
      },
      enum: '{{testStationsTreeData}}',
    },
    keeper_id: {
      type: 'string',
      title: '保管员',
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
      'x-reactions': [
        {
          dependencies: ['test_station_id'],
          fulfill: {
            state: {
              dataSource: '{{testStationKeepersRecords[$deps[0]]}}',
            },
          },
        },
      ],
    },
    code: {
      type: 'string',
      title: '仪器编码',
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
    model: {
      type: 'string',
      title: '仪器型号',
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
    manufacturer: {
      type: 'string',
      title: '生产厂家',
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
    serial_number: {
      type: 'string',
      title: '出厂编号',
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
    ip: {
      type: 'string',
      title: 'IP地址',
      'x-validator': [
        {
          format: 'ipv4',
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
        allowClear: true,
      },
    },
    port: {
      type: 'number',
      title: '端口号',
      'x-validator': [
        {
          minimum: 0,
          maximum: 65535,
        },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        placeholder: '请输入',
        allowClear: true,
      },
    },
    purchase_time: {
      type: 'string',
      title: '购买时间',
      'x-decorator': 'FormItem',
      'x-component': 'DatePicker',
    },
    show_in_report: {
      type: 'string',
      title: '在报告中显示',
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      enum: '{{showInReportEnumOptions}}',
    },
    correct_level: {
      type: 'string',
      title: '准确级',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入',
        allowClear: true,
      },
    },
    description: {
      type: 'string',
      title: '备注',
      'x-decorator': 'FormItem',
      'x-component': 'Input.TextArea',
      'x-component-props': {
        placeholder: '请输入',
        allowClear: true,
      },
    },
  },
}

const openTestInstrumentEditor = (id?: number | string) => {
  const dialog = FormDialog(id ? '编辑' : '新增', () => {
    const testInstrumentTypes = useRecoilValue(testInstrumentTypesState)
    const testInstrumentTypesEnumOptions = useMemo(() => {
      return testInstrumentTypes.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
    }, [testInstrumentTypes])

    const testAreas = useRecoilValue(testAreasState)
    const testStations = useRecoilValue(testStationsState)
    const testStationsTreeData = useMemo(() => {
      return testAreas.map(({ id, name }) => ({
        key: `test-area-${id}`,
        value: `test-area-${id}`,
        title: name,
        selectable: false,
        isLeaf: false,
        children: testStations
          .filter(({ test_area_id }) => id === test_area_id)
          .map(({ id, name }) => ({
            key: id,
            value: id,
            title: name,
            selectable: true,
            isLeaf: true,
          })),
      }))
    }, [testAreas, testStations])

    const testStationKeepersRecords = useMemo(() => {
      return _.fromPairs(
        testStations.map(({ id, test_users }) => [
          id,
          test_users?.map(({ id, name, nick_name }) => ({
            label: nick_name ?? name,
            value: id,
          })) ?? [],
        ]),
      )
    }, [testStations])

    return (
      <FormLayout labelCol={5} wrapperCol={19}>
        <SchemaField
          schema={schema}
          scope={{
            filterTreeNodeTitle,
            testInstrumentTypesEnumOptions,
            testStationsTreeData,
            testStationKeepersRecords,
            showInReportEnumOptions,
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
            data: ITestInstrument
          }>
        > = await request.get(`/api/v1/instruments/${id}`)
        if (response.data.code !== 0) {
          throw new Error(response.data.message ?? '')
        }
        let data = _.cloneDeep(response.data.data ?? {})
        {
          // data transform
          data = {
            ...data,
            id: undefined,
            purchase_time: dayjs(data.purchase_time).format('YYYY-MM-DD'),
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
    let data = _.cloneDeep<ITestInstrument>(payload.values)
    {
      // data transform
      data = {
        ...data,
        purchase_time: dayjs(data.purchase_time).startOf('day').valueOf(),
      }
    }
    try {
      if (id) {
        await request.put(`/api/v1/instruments/${id}`, data)
      } else {
        await request.post('/api/v1/instruments', data)
      }
    } catch (err) {
      message.error((err as Error).message)
      return Promise.reject(err)
    }
    return next()
  })
  return dialog.open()
}

const TestInstrumentIsDisableSwitch = (props: { record: ITestInstrument }) => {
  const [status, setStatus] = useState(props.record.is_disabled ?? 0)
  const [loading, setLoading] = useState(false)

  return (
    <Switch
      checked={status === 0}
      checkedChildren={isDisabledNames[0]}
      unCheckedChildren={isDisabledNames[1]}
      loading={loading}
      onChange={async () => {
        const op = status === 0 ? 1 : 0
        setLoading(true)
        try {
          await request.post(`/api/v1/instruments/${props.record.id}/disable`, {
            op,
          })
          setStatus(op)
        } catch (err) {
          message.error((err as Error).message)
        }
        setLoading(false)
      }}
    />
  )
}

const List = () => {
  const tableActionRef = useRef<ActionType>()

  const [tableSelectedRowKeys, setTableSelectedRowKeys] = useState<
    (number | string)[]
  >([])

  const columns = useMemo<ProColumns<ITestInstrument>[]>(
    () => [
      {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 34,
        fixed: 'left',
      },
      {
        title: '仪器名称',
        dataIndex: 'name',
        fixed: 'left',
        render: (dom) => <div className="min-w-28">{dom}</div>,
      },
      {
        title: '仪器编码',
        dataIndex: 'code',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '仪器型号',
        dataIndex: 'model',
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '仪器类型',
        dataIndex: 'instrument_type',
        hideInSearch: true,
        render: (dom) => <div className="min-w-28">{dom}</div>,
      },
      {
        title: '工位名称',
        dataIndex: 'test_station',
        hideInSearch: true,
        render: (dom) => <div className="min-w-28">{dom}</div>,
      },
      {
        title: '保管员',
        dataIndex: 'keeper',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '生产厂家',
        dataIndex: 'manufacturer',
        render: (dom) => <div className="min-w-28">{dom}</div>,
      },
      {
        title: '出厂编号',
        dataIndex: 'serial_number',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '购买时间',
        dataIndex: 'purchase_time',
        valueType: 'date',
        hideInSearch: true,
        render: (dom) => <div className="min-w-18">{dom}</div>,
      },
      {
        title: 'IP地址',
        dataIndex: 'ip',
        hideInSearch: true,
        render: (dom) => <div className="min-w-26">{dom}</div>,
      },
      {
        title: '端口号',
        dataIndex: 'port',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '准确级',
        dataIndex: 'correct_level',
        hideInSearch: true,
        render: (dom) => <div className="min-w-14">{dom}</div>,
      },
      {
        title: '在报告中显示',
        dataIndex: 'show_in_report',
        hideInSearch: true,
        render: (dom, record) => (
          <div className="min-w-22">
            {typeof record.show_in_report === 'number' && (
              <Tag
                className="mr-0!"
                color={showInReportColors[record.show_in_report]}
              >
                {showInReportNames[record.show_in_report]}
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: '仪器描述',
        dataIndex: 'description',
        hideInSearch: true,
        render: (dom) => <div className="min-w-28">{dom}</div>,
      },
      {
        title: '封存',
        dataIndex: 'is_disabled',
        hideInSearch: true,
        fixed: 'right',
        render: (dom, record) => (
          <div className="min-w-14">
            <TestInstrumentIsDisableSwitch record={record} />
          </div>
        ),
      },
      {
        title: '操作',
        key: 'option',
        valueType: 'option',
        fixed: 'right',
        render: (dom, record) => (
          <div className="min-w-16">
            <Space size={['small', 0]} wrap>
              <Typography.Link
                onClick={async () => {
                  await openTestInstrumentEditor(record.id)
                  tableActionRef.current?.reload()
                }}
              >
                编辑
              </Typography.Link>
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={async () => {
                  await request.delete(`/api/v1/instruments/${record.id}`)
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
      <ProTable<ITestInstrument>
        actionRef={tableActionRef}
        request={async ({ current, pageSize, ...params }) => {
          try {
            const response: AxiosResponse<
              Partial<{
                code: number
                message: string
                data: {
                  list: ITestInstrument[]
                  page: number
                  page_size: number
                  total: number
                }
              }>
            > = await request.get('/api/v1/instruments', {
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
                    `/api/v1/instruments/${selectedRowKeys.join(',')}`,
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
                await openTestInstrumentEditor()
                tableActionRef.current?.reload()
              }}
            >
              新增
            </Button>,
          ],
        }}
        options={false}
        scroll={{ x: true }}
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
