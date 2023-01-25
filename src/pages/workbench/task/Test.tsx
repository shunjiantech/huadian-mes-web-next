/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageContainer } from '@ant-design/pro-layout'
import {
  ArrayTable,
  DatePicker,
  Form,
  FormButtonGroup,
  FormCollapse,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Radio,
  SelectTable,
  Space,
  Submit,
} from '@formily/antd'
import { createForm } from '@formily/core'
import { createSchemaField } from '@formily/react'
import { message, TabsProps } from 'antd'
import dayjs from 'dayjs'
import _ from 'lodash-es'
import queryString from 'query-string'
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import getTestDataState from '@/store/getTestDataState'
import getTestItemLayoutsState from '@/store/getTestItemLayoutsState'
import getTestStationInstrumentsState from '@/store/getTestStationInstrumentsState'
import testConclusionsState from '@/store/testConclusions'
import { isBigIntStr } from '@/utils/bigintString'
import request from '@/utils/request'

const SchemaField = createSchemaField({
  components: {
    ArrayTable,
    DatePicker,
    FormCollapse,
    FormItem,
    FormLayout,
    Input,
    NumberPicker,
    Radio,
    SelectTable,
    Space,
  },
})

const schemaFind = (
  schema: any,
  callback: (item: any, key: string) => boolean,
) => {
  const r = (current: string): string | null => {
    const obj = _.get(schema, current, {})
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (callback(obj[key], key)) {
          return `${current}.${key}`
        }
        const child = r(`${current}.${key}.properties`)
        if (child) {
          return child
        }
      }
    }
    return null
  }
  return r('properties')
}

const TestItem = (props: {
  deviceId: number | string
  testItemId: number | string
  testStationId: number | string
  readPretty: boolean
}) => {
  const testItemLayouts = useRecoilValue(
    getTestItemLayoutsState(props.testItemId),
  )
  const layoutContent = useMemo(
    () => JSON.parse(testItemLayouts?.[0]?.content ?? '{}'),
    [testItemLayouts],
  )
  const layoutContentSchema = useMemo(() => {
    const schema = _.cloneDeep(layoutContent?.schema ?? {})
    if (props.readPretty) {
      Object.keys(schema.properties ?? {}).forEach((key) => {
        schema.properties[key]['x-pattern'] = 'readPretty'
      })
    }
    const instrumentIdsPath = schemaFind(
      schema,
      (item, key) => key === 'instrument_ids',
    )
    if (instrumentIdsPath) {
      _.set(schema, instrumentIdsPath, {
        type: 'array',
        'x-decorator': 'FormItem',
        'x-component': 'SelectTable',
        'x-component-props': {
          mode: 'multiple',
          primaryKey: 'id',
          pagination: false,
        },
        enum: '{{testStationInstrumentsDateFormated}}',
        properties: {
          name: {
            title: '仪器名称',
            type: 'string',
            'x-component': 'SelectTable.Column',
          },
          model: {
            title: '仪器型号',
            type: 'string',
            'x-component': 'SelectTable.Column',
          },
          code: {
            title: '仪器编号',
            type: 'string',
            'x-component': 'SelectTable.Column',
          },
          valid_until: {
            title: '有效期',
            type: 'string',
            'x-component': 'SelectTable.Column',
          },
          correct_level: {
            title: '准确级',
            type: 'string',
            'x-component': 'SelectTable.Column',
          },
        },
      })
    }
    return schema
  }, [layoutContent, props.readPretty])

  const testStationInstruments = useRecoilValue(
    getTestStationInstrumentsState(props.testStationId),
  )
  const testStationInstrumentsDateFormated = useMemo(() => {
    return testStationInstruments.map((item) => ({
      ...item,
      valid_until:
        item.valid_until && dayjs(item.valid_until).format('YYYY-MM-DD'),
    }))
  }, [testStationInstruments])
  const testConclusions = useRecoilValue(testConclusionsState)
  const testConclusionsEnumOptions = useMemo(
    () =>
      testConclusions.map(({ id, name }) => ({
        label: name,
        value: id,
      })),
    [testConclusions],
  )

  const testData = useRecoilValue(
    getTestDataState(props.deviceId, props.testItemId),
  )

  const form = useMemo(() => {
    const form = createForm()
    form.setValues({
      ..._.omit(testData, [
        'test_user_id',
        'test_user',
        'secondary_test_user_id',
        'secondary_test_user',
        'end_time',
      ]),
      start_time: dayjs(testData.start_time).format('YYYY-MM-DD'),
      test_data:
        testData.test_data?.map((item: any) =>
          _.fromPairs(
            Object.keys(item)
              .filter((key) => item[key])
              .map((key) => [key, item[key]]),
          ),
        ) ?? [],
    })
    return form
  }, [])

  const handleSave = useCallback(async (values: any) => {
    const saveData = {
      device_id: props.deviceId,
      test_datas: [
        {
          test_item_id: props.testItemId,
          ...values,
        },
      ],
    }
    try {
      const response = await request.post('/api/v1/tasks/test_data', saveData)
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
      }
      message.success('保存成功')
    } catch (err) {
      message.error((err as Error).message)
    }
  }, [])

  return (
    <Form form={form} {...(layoutContent?.form ?? {})}>
      <SchemaField
        schema={layoutContentSchema}
        scope={{
          testStationInstrumentsDateFormated,
          testConclusionsEnumOptions,
        }}
      />
      {!props.readPretty && (
        <FormButtonGroup.Sticky align="right">
          <FormButtonGroup>
            <Submit onSubmit={handleSave}>保存</Submit>
          </FormButtonGroup>
        </FormButtonGroup.Sticky>
      )}
    </Form>
  )
}

const Test = () => {
  const params = useParams()

  const paramsDeviceId = useMemo(
    () =>
      (isBigIntStr(params.device_id)
        ? params.device_id
        : Number(params.device_id)) ?? 0,
    [params.device_id],
  )

  const location = useLocation()
  const locationSearch = useMemo(
    () => queryString.parse(location.search),
    [location.search],
  )
  const locationSearchItems: {
    id: number | string
    name: string
    view: number
  }[] = useMemo(
    () =>
      typeof locationSearch.items === 'string'
        ? JSON.parse(decodeURIComponent(locationSearch.items))
        : [],
    [locationSearch.items],
  )

  const tabItems: TabsProps['items'] = useMemo(
    () =>
      locationSearchItems.map(({ id, name }) => ({
        label: name,
        key: `${id}`,
      })),
    [locationSearchItems],
  )

  const locationSearchTestStationId = useMemo(
    () =>
      typeof locationSearch.test_station_id === 'string'
        ? isBigIntStr(locationSearch.test_station_id)
          ? locationSearch.test_station_id
          : Number(locationSearch.test_station_id)
        : 0,
    [locationSearch.test_station_id],
  )

  const [activeKey, setActiveKey] = useState(locationSearchItems[0]?.id ?? 0)

  const globalReadPretty = useMemo(
    () =>
      typeof locationSearch.view === 'string' && locationSearch.view === '1',
    [locationSearch.view],
  )
  const testItemReadPretty = useMemo(
    () => locationSearchItems.find(({ id }) => id === activeKey)?.view === 1,
    [locationSearchItems, activeKey],
  )

  return (
    <PageContainer
      tabActiveKey={`${activeKey}`}
      tabList={[]}
      tabProps={{
        items: tabItems,
      }}
      onTabChange={(key) => {
        setActiveKey(isBigIntStr(key) ? key : Number(key))
      }}
    >
      {paramsDeviceId && locationSearchTestStationId && activeKey && (
        <TestItem
          deviceId={paramsDeviceId}
          testItemId={activeKey}
          testStationId={locationSearchTestStationId}
          readPretty={globalReadPretty || testItemReadPretty}
          key={`${paramsDeviceId}-${activeKey}`}
        />
      )}
    </PageContainer>
  )
}

export default Test
