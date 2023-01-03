import { useFullscreen, useSize } from 'ahooks'
import { Carousel, message, Progress } from 'antd'
import { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import ReactEChartsCore from 'echarts-for-react/esm/core'
import _ from 'lodash-es'
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import bgGridUrl from '@/assets/dashboard/bg_grid.png'
import footerBgUrl from '@/assets/dashboard/footer.svg'
import headerBgUrl from '@/assets/dashboard/header_bg.svg'
import icCalendarUrl from '@/assets/dashboard/ic_calendar.svg'
import icFullscreenUrl from '@/assets/dashboard/ic_fullscreen.svg'
import icPowerUrl from '@/assets/dashboard/ic_power.svg'
import leftBg1Url from '@/assets/dashboard/left_bg1.svg'
import leftBg2Url from '@/assets/dashboard/left_bg2.svg'
import leftBg3Url from '@/assets/dashboard/left_bg3.svg'
import logoUrl from '@/assets/dashboard/logo@2x.png'
import middleBg1Url from '@/assets/dashboard/middle_bg1.svg'
import middleBg2Url from '@/assets/dashboard/middle_bg2.svg'
import middleBlock2ItemBgUrl from '@/assets/dashboard/middle_block2_item_bg.svg'
import middleImgUrl from '@/assets/dashboard/middle_img.png'
import rightBg1Url from '@/assets/dashboard/right_bg1.svg'
import rightBg2Url from '@/assets/dashboard/right_bg2.svg'
import request from '@/utils/request'

import css from './Dashboard.module.css'

echarts.use([
  SVGRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const HeaderButton = (
  props: PropsWithChildren<{ icon?: string; onClick?: () => void }>,
) => {
  const { icon, children, ...rootProps } = props
  return (
    <div
      className="ml-12px p-4px h-32px bg-#2c2c2c rounded-4px text-16px leading-22px flex items-center cursor-pointer transition-all hover:opacity-80"
      {...rootProps}
    >
      {icon && (
        <div
          className="w-24px h-24px mr-8px bg-no-repeat bg-contain bg-center"
          style={{ backgroundImage: `url(${icon})` }}
        ></div>
      )}
      {children}
    </div>
  )
}

const Header = (props: {
  exitFullscreen?: () => void
  toggleFullscreen?: () => void
}) => {
  // 实时时间
  const [now, setNow] = useState({
    str1: '',
    str2: '',
  })
  const setNowFn = useCallback(() => {
    const d = dayjs()
    setNow({
      str1: d.format('YYYY/MM/DD HH:mm:ss'),
      str2: ['日', '一', '二', '三', '四', '五', '六'][d.get('d')],
    })
  }, [])
  useEffect(() => {
    setNowFn()
    const timer = setInterval(setNowFn, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  // 退出页面
  const navigate = useNavigate()
  const handleExit = useCallback(() => {
    props.exitFullscreen?.()
    navigate('/')
  }, [props.exitFullscreen])

  return (
    <div
      className="relative h-100px"
      style={{ backgroundImage: `url(${headerBgUrl})` }}
    >
      <img
        className="absolute left-10px top-10px h-74px opacity-0" // 隐藏LOGO
        src={logoUrl}
        alt="LOGO"
      />
      <div className="absolute left-312px top-20px color-white text-16px leading-22px text-center">
        <div>
          <span>温度：--°C</span>
          <span className="ml-8px">湿度：--%hr</span>
        </div>
        <div className="mt-8px">
          <span>气压：--Pa</span>
        </div>
      </div>
      <div className="absolute right-38px top-26px color-white flex items-center">
        <div className="text-20px leading-24px flex items-center">
          <div
            className="w-24px h-24px bg-no-repeat bg-contain bg-center"
            style={{ backgroundImage: `url(${icCalendarUrl})` }}
          ></div>
          <span className="ml-8px">{now.str1}</span>
          <span className="ml-8px">星期{now.str2}</span>
        </div>
        <HeaderButton icon={icPowerUrl} onClick={handleExit}>
          退出
        </HeaderButton>
        <HeaderButton icon={icFullscreenUrl} onClick={props.toggleFullscreen}>
          全屏
        </HeaderButton>
      </div>
    </div>
  )
}

const NUMS = ['①', '②', '③', '④', '⑤', '⑥']

const CHART_LEFT1_DEFAULT = {
  backgroundColor: '',
  grid: {
    left: 0,
    top: 20 + 36,
    right: 0,
    bottom: 5,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [] as string[],
    axisLine: {
      lineStyle: {
        color: '#fff',
        opacity: 0.8,
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 29,
      opacity: 0.85,
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 14,
      opacity: 0.85,
    },
    splitLine: {
      lineStyle: {
        color: ['#fff'],
        type: [2, 2],
        opacity: 0.15,
      },
    },
  },
  series: [
    {
      type: 'bar',
      data: [] as number[],
      label: {
        show: true,
        color: '#fff',
        fontWeight: 400,
        fontSize: 12,
        lineHeight: 16,
        position: 'top',
      },
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: '#2276fc',
            },
            {
              offset: 1,
              color: '#0f2a54',
            },
          ],
          global: false,
        },
      },
      barWidth: 24,
    },
  ],
}

const CHART_LEFT2_DEFAULT = {
  backgroundColor: '',
  legend: {
    data: ['项目数量', '合格率'],
    textStyle: {
      color: '#fff',
    },
  },
  grid: {
    // 40px style margin: 0 -40px -40px;
    left: 40,
    top: 20 + 16 + 16,
    right: 40,
    bottom: 10,
    containLabel: true,
  },
  xAxis: {
    z: 1000,
    type: 'category',
    data: [] as string[],
    axisLine: {
      lineStyle: {
        color: '#fff',
        opacity: 0.8,
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      interval: 0,
      align: 'center',
      color: '#fff',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 12,
      opacity: 0.85,
    },
  },
  yAxis: [
    {
      type: 'value',
      name: '项目数量',
      nameGap: 30,
      axisLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 14,
        opacity: 0.85,
      },
      splitLine: {
        lineStyle: {
          color: ['#fff'],
          type: [2, 2],
          opacity: 0.15,
        },
      },
    },
    {
      type: 'value',
      name: '合格率',
      nameGap: 30,
      position: 'right',
      min: 0,
      max: 100,
      axisLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 14,
        opacity: 0.85,
      },
      splitLine: {
        show: false,
      },
    },
  ],
  series: [
    {
      name: '项目数量',
      type: 'bar',
      yAxisIndex: 0,
      data: [] as number[],
      label: {
        show: true,
        color: '#fff',
        fontWeight: 400,
        fontSize: 12,
        lineHeight: 16,
        position: 'top',
      },
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: '#2276fc',
            },
            {
              offset: 1,
              color: '#0f2a54',
            },
          ],
          global: false,
        },
      },
      barWidth: 24,
    },
    {
      name: '合格率',
      type: 'bar',
      yAxisIndex: 1,
      data: [] as number[],
      label: {
        show: true,
        color: '#fff',
        fontWeight: 400,
        fontSize: 12,
        lineHeight: 16,
        position: 'top',
        formatter: '{c}%',
      },
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: '#ffcf5f',
            },
            {
              offset: 1,
              color: '#aa9966',
            },
          ],
          global: false,
        },
      },
      barWidth: 24,
    },
  ],
}

const CHART_MIDDLE1_DEFAULT = {
  backgroundColor: '',
  grid: {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  series: [
    {
      type: 'pie',
      radius: '80%',
      center: ['20%', '50%'],
      data: [] as unknown[],
      label: {
        position: 'inside',
        formatter: '{b}\n{c}台',
        color: '#fff',
        textBorderColor: 'rgba(0, 0, 0, 0.5)',
        textBorderWidth: 2,
      },
    },
  ],
}

const CHART_RIGHT1_DEFAULT = {
  backgroundColor: '',
  grid: {
    left: 20,
    top: 20 + 16,
    right: 36,
    bottom: 5,
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    min: 0,
    max: 100,
    axisLabel: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 14,
      opacity: 0.85,
    },
    splitLine: {
      lineStyle: {
        color: ['#fff'],
        type: [2, 2],
        opacity: 0.15,
      },
    },
  },
  yAxis: {
    z: 1000,
    name: '报告号',
    type: 'category',
    data: [] as string[],
    axisLine: {
      lineStyle: {
        color: '#fff',
        opacity: 0.8,
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 29,
      opacity: 0.85,
    },
  },
  series: [
    {
      type: 'bar',
      data: [] as number[],
      label: {
        show: true,
        color: '#fff',
        fontWeight: 400,
        fontSize: 12,
        lineHeight: 16,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: ({ value }: any) => {
          if (value <= 1) {
            // eslint-disable-next-line no-irregular-whitespace
            return `　　${value}%`
          } else if (value <= 4) {
            // eslint-disable-next-line no-irregular-whitespace
            return `　${value}%`
          }
          return `${value}%`
        },
      },
      itemStyle: {
        color: {
          type: 'linear',
          x: 1,
          y: 0,
          x2: 0,
          y2: 0,
          colorStops: [
            {
              offset: 0,
              color: '#2276fc',
            },
            {
              offset: 1,
              color: '#0f2a54',
            },
          ],
          global: false,
        },
      },
      barWidth: 42,
    },
  ],
}

const Dashboard = () => {
  // 滚动条暗色
  useEffect(() => {
    document.documentElement.style.colorScheme = 'dark'
    return () => {
      document.documentElement.style.colorScheme = ''
    }
  }, [])

  const rootDiv = useRef(null)
  const rootDivSize = useSize(rootDiv)
  const width = useMemo(() => rootDivSize?.width ?? 0, [rootDivSize])
  const scale = useMemo(() => width / 1920, [width])

  const [, { exitFullscreen, toggleFullscreen }] = useFullscreen(rootDiv)

  const sixMonthStart = useMemo(
    () => dayjs().subtract(5, 'month').startOf('month'),
    [],
  )
  const monthStart = useMemo(() => dayjs().startOf('month'), [])
  const monthEnd = useMemo(() => dayjs().endOf('month'), [])
  const yearStart = useMemo(() => dayjs().startOf('year'), [])
  const yearEnd = useMemo(() => dayjs().endOf('year'), [])

  const [left1Data, setLeft1Data] = useState<
    {
      name: string
      passed: number
      inspected: number
    }[][]
  >([])
  const fetchLeft1Data = useCallback(async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            list: typeof left1Data[0]
            total_inspected: number
            total_passed: number
          }
        }>
      > = await request.get('/api/v1/statistics/devices/pass_rate', {
        params: {
          start_date: monthStart.format('YYYY-MM-DD'),
          end_date: monthEnd.format('YYYY-MM-DD'),
        },
      })
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
      }
      setLeft1Data(_.chunk(response.data.data?.list, 3))
    } catch (err) {
      message.error((err as Error).message)
    }
  }, [])

  const [chartLeft1, setChartLeft1] = useState(CHART_LEFT1_DEFAULT)
  const fetchChartLeft1 = useCallback(async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            list: {
              day: number
              count: number
            }[]
            total: number
          }
        }>
      > = await request.get('/api/v1/statistics/devices/count', {
        params: {
          start_date: sixMonthStart.format('YYYY-MM'),
          end_date: monthEnd.format('YYYY-MM'),
        },
      })
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj: any = {}
      let month = sixMonthStart.clone()
      for (let i = 0; i < 6; i++) {
        obj[month.valueOf()] = 0
        month = month.add(1, 'month')
      }
      const data = _.assign(
        {},
        obj,
        _.chain(response.data.data?.list)
          .keyBy('day')
          .mapValues('count')
          .value(),
      )
      const newChartLeft1 = _.cloneDeep(CHART_LEFT1_DEFAULT)
      newChartLeft1.xAxis.data = _.keys(data).map((item) =>
        dayjs(Number(item)).format('MMMM'),
      )
      newChartLeft1.series[0].data = _.values(data)
      setChartLeft1(newChartLeft1)
    } catch (err) {
      message.error((err as Error).message)
    }
  }, [])

  const [chartLeft2, setChartLeft2] = useState(CHART_LEFT2_DEFAULT)
  const [chartLeft2TitleList, setChartLeft2TitleList] = useState<string[]>([])
  const fetchChartLeft2 = useCallback(async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            list: {
              name: string
              inspected: number
              passed: number
            }[]
            total_inspected: number
            total_passed: number
          }
        }>
      > = await request.get('/api/v1/statistics/test_items/pass_rate', {
        params: {
          start_date: monthStart.format('YYYY-MM-DD'),
          end_date: monthEnd.format('YYYY-MM-DD'),
        },
      })
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
      }
      const data = _.chain(response.data.data?.list.slice(0, 6))
        .keyBy('name')
        .mapValues((item) => [item.inspected, item.passed])
        .value()
      setChartLeft2TitleList([..._.keys(data)])
      const newChartLeft2 = _.cloneDeep(CHART_LEFT2_DEFAULT)
      newChartLeft2.xAxis.data = [
        ..._.keys(data).map((_, index) => NUMS[index]),
      ]
      const seriesList = _.unzip(_.values(data))
      seriesList[0] = seriesList[0] || []
      seriesList[1] = seriesList[1] || []
      newChartLeft2.series[0].data = [...seriesList[0]]
      newChartLeft2.series[1].data = [
        ...seriesList[1].map((item, index) =>
          Math.round((item / seriesList[0][index]) * 100),
        ),
      ]
      setChartLeft2(newChartLeft2)
    } catch (err) {
      message.error((err as Error).message)
    }
  }, [])

  const [chartMiddle1InfoTotal, setChartMiddle1InfoTotal] = useState('')
  const fetchChartMiddle1InfoTotal = useCallback(async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            total: number
          }
        }>
      > = await request.get('/api/v1/statistics/devices')
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
      }
      setChartMiddle1InfoTotal(
        `${response.data.data?.total ?? 0}`.replace(/\B(?=(\d{3})+$)/g, ','),
      )
    } catch (err) {
      message.error((err as Error).message)
    }
  }, [])

  const [chartMiddle1, setChartMiddle1] = useState(CHART_MIDDLE1_DEFAULT)
  const fetchChartMiddle1 = useCallback(async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            total: number
            running: number
            stopped: number
            malfunctioning: number
          }
        }>
      > = await request.get('/api/v1/statistics/instruments')
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
      }
      const newChartMiddle1 = _.cloneDeep(CHART_MIDDLE1_DEFAULT)
      newChartMiddle1.series[0].data.push({
        name: '故障设备台数',
        value: response.data.data?.malfunctioning ?? 0,
        itemStyle: {
          color: '#ffcf5f',
        },
      })
      newChartMiddle1.series[0].data.push({
        name: '未运设备台数',
        value: response.data.data?.stopped ?? 0,
        itemStyle: {
          color: '#a655e5',
        },
      })
      newChartMiddle1.series[0].data.push({
        name: '在运设备台数',
        value: response.data.data?.running ?? 0,
        itemStyle: {
          color: '#2276fc',
        },
      })
      setChartMiddle1(newChartMiddle1)
    } catch (err) {
      message.error((err as Error).message)
    }
  }, [])

  const [chartMiddle1Info, setChartMiddle1Info] = useState({
    inspected: 0,
    inspecting: 0,
    passed: 0,
    pending: 0,
  })
  const fetchChartMiddle1Info = useCallback(async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            inspected: number
            inspecting: number
            passed: number
            pending: number
          }
        }>
      > = await request.get('/api/v1/statistics/devices', {
        params: {
          start_date: yearStart.format('YYYY-MM-DD'),
          end_date: yearEnd.format('YYYY-MM-DD'),
        },
      })
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
      }
      setChartMiddle1Info({
        inspected: response.data.data?.inspected ?? 0,
        inspecting: response.data.data?.inspecting ?? 0,
        passed: response.data.data?.passed ?? 0,
        pending: response.data.data?.pending ?? 0,
      })
    } catch (err) {
      message.error((err as Error).message)
    }
  }, [])

  const [description, setDescription] = useState<string[]>([])
  const fetchDescription = useCallback(async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            description: string
          }
        }>
      > = await request.get('/api/v1/statistics/labs/info')
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
      }
      setDescription((response.data.data?.description ?? '').split(/\r?\n/))
    } catch (err) {
      message.error((err as Error).message)
    }
  }, [])

  const [chartRight1, setChartRight1] = useState(CHART_RIGHT1_DEFAULT)
  const fetchChartRight1 = useCallback(async () => {
    try {
      const response: AxiosResponse<
        Partial<{
          code: number
          message: string
          data: {
            list: {
              name: string
              total: number
              inspected: number
            }[]
            total_total: number
            total_inspected: number
          }
        }>
      > = await request.get('/api/v1/statistics/devices/progress', {
        params: {
          start_date: monthStart.format('YYYY-MM-DD'),
          end_date: monthEnd.format('YYYY-MM-DD'),
        },
      })
      if (response.data.code !== 0) {
        throw new Error(response.data.message ?? '')
      }
      const data = (response.data.data?.list ?? [])
        .slice(0, 5)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => ({
          ...item,
          value: Math.round((item.inspected / item.total) * 100),
        }))
      const newChartRight1 = _.cloneDeep(CHART_RIGHT1_DEFAULT)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newChartRight1.yAxis.data = data.map((item: any) => item.name).reverse()
      newChartRight1.series[0].data = data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.value)
        .reverse()
      setChartRight1(newChartRight1)
    } catch (err) {
      message.error((err as Error).message)
    }
  }, [])

  const initialize = useCallback(
    _.once(() => {
      fetchLeft1Data()
      fetchChartLeft1()
      fetchChartLeft2()
      fetchChartMiddle1InfoTotal()
      fetchChartMiddle1()
      fetchChartMiddle1Info()
      fetchDescription()
      fetchChartRight1()
    }),
    [],
  )
  useEffect(() => {
    initialize()
  }, [])

  return (
    <div ref={rootDiv}>
      <div
        className="overflow-hidden"
        style={{
          width: `${width}px`,
          height: `max(${1080 * scale}px, 100vh)`,
        }}
      >
        <div
          className="w-1920px h-1080px bg-#040711 overflow-hidden origin-top-left"
          style={{
            transform: `scale(${scale})`,
            backgroundImage: `url(${bgGridUrl})`,
          }}
        >
          <Header
            exitFullscreen={exitFullscreen}
            toggleFullscreen={toggleFullscreen}
          />
          {/* body */}
          <div className="flex justify-center">
            {/* 左侧区域 */}
            <div className="flex flex-col items-center">
              {/* 左侧区域块1 */}
              <div
                className="relative mt-15px w-472px h-194px bg-no-repeat"
                style={{ backgroundImage: `url(${leftBg1Url})` }}
              >
                <div className="absolute left-0 top-50px right-0 bottom-0">
                  <Carousel
                    dots={{
                      className: css.dots,
                    }}
                    dotPosition="top"
                    autoplay
                  >
                    {left1Data.map((row, rowIndex) => (
                      <div className="h-100px" key={rowIndex}>
                        <div className="color-white flex justify-between">
                          {row.map((col, colIndex) => (
                            <Progress
                              key={colIndex}
                              type="circle"
                              strokeLinecap="square"
                              strokeColor="#129bff"
                              strokeWidth={4}
                              trailColor="#00446a"
                              width={100}
                              percent={Math.round(
                                (col.passed / col.inspected) * 100,
                              )}
                              format={(percent) => (
                                <>
                                  <div className="color-white text-12px font-400 leading-16.8px">
                                    {col.name}
                                  </div>
                                  <div className="color-#129bff text-24px font-700 leading-none">
                                    {percent}%
                                  </div>
                                </>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </Carousel>
                </div>
              </div>
              {/* 左侧区域块2 */}
              <div
                className="relative mt-15px w-472px h-334px bg-no-repeat"
                style={{ backgroundImage: `url(${leftBg2Url})` }}
              >
                <div className="absolute left-0 top-50px right-0 bottom-0">
                  <ReactEChartsCore
                    className="h-full!"
                    echarts={echarts}
                    opts={{ renderer: 'svg' }}
                    option={chartLeft1}
                  />
                </div>
              </div>
              {/* 左侧区域块3 */}
              <div
                className="relative mt-5px w-472px h-334px bg-no-repeat"
                style={{ backgroundImage: `url(${leftBg3Url})` }}
              >
                <div className="absolute left-0 top-50px right-0 bottom-0">
                  <div
                    style={{
                      margin: '0 -40px',
                      width: 'calc(100% + 80px)',
                      height: 'calc(100% - 96px)',
                    }}
                  >
                    <ReactEChartsCore
                      className="h-full!"
                      echarts={echarts}
                      opts={{ renderer: 'svg' }}
                      option={chartLeft2}
                    />
                  </div>
                  <div className="pl-8px">
                    {chartLeft2TitleList.map((title, index) => (
                      <div
                        className="color-white text-12px leading-16px"
                        key={index}
                      >
                        {NUMS[index]} {title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* 中间区域 */}
            <div className="flex flex-col items-center px-32px">
              {/* 中间区域块1 */}
              <div
                className="relative mt-32px w-796px h-567px bg-no-repeat"
                style={{ backgroundImage: `url(${middleBg1Url})` }}
              >
                {/* 背景图 */}
                <div
                  className="absolute top-36px left-14.5px w-767px h-514px"
                  style={{ backgroundImage: `url(${middleImgUrl})` }}
                >
                  {/* 背景图阴影 */}
                  <div
                    className="absolute w-full h-30%"
                    style={{
                      backgroundImage:
                        'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0))',
                    }}
                  ></div>
                </div>
                {/* 背景图左上角信息 */}
                <div className="absolute left-33.5px top-50px color-white">
                  <div className="text-14px font-500 leading-20px">
                    检测产品数量
                  </div>
                  <div className="text-40px font-700 leading-48px tracking-2px">
                    {chartMiddle1InfoTotal}
                  </div>
                </div>
              </div>
              {/* 中间区域块2 */}
              <div
                className="relative mt-17px w-793px h-298px bg-no-repeat"
                style={{ backgroundImage: `url(${middleBg2Url})` }}
              >
                <div className="absolute left-0 top-50px right-0 bottom-0">
                  <ReactEChartsCore
                    className="h-full!"
                    echarts={echarts}
                    opts={{ renderer: 'svg' }}
                    option={chartMiddle1}
                  />
                </div>
                <div className="absolute left-40% top-40px right--9px bottom-0 flex flex-wrap justify-end content-center">
                  {[
                    {
                      title: '待检（当年）',
                      value: `${chartMiddle1Info.pending}件`,
                    },
                    {
                      title: '在检（当年）',
                      value: `${chartMiddle1Info.inspecting}件`,
                    },
                    {
                      title: '已检（当年）',
                      value: `${chartMiddle1Info.inspected}件`,
                    },
                    {
                      title: '产品总合格率（当年）',
                      value: `${
                        chartMiddle1Info.passed + chartMiddle1Info.inspected ===
                        0
                          ? '--'
                          : Math.round(
                              (chartMiddle1Info.passed /
                                chartMiddle1Info.inspected) *
                                1000,
                            ) / 10
                      }%`,
                    },
                  ].map(({ title, value }, index) => (
                    <div
                      className="m-11px pl-72px pt-12.5px w-218px h-73px"
                      style={{
                        backgroundImage: `url(${middleBlock2ItemBgUrl})`,
                      }}
                      key={index}
                    >
                      <div className="color-white text-22px font-700 leading-26px">
                        {value}
                      </div>
                      <div className="mt-4px color-white text-13px font-400 leading-18px opacity-60">
                        {title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* 右侧区域 */}
            <div className="flex flex-col items-center">
              {/* 右侧区域块1 */}
              <div
                className="relative mt-15px w-472px h-523px bg-no-repeat"
                style={{ backgroundImage: `url(${rightBg1Url})` }}
              >
                <div className="mt-57px mb-10px h-456px overflow-auto">
                  {description.map((str, index) => (
                    <p
                      className="m-0 p-0 color-white text-18px font-400 leading-30px indent-2em"
                      key={index}
                    >
                      {str}
                    </p>
                  ))}
                </div>
              </div>
              {/* 右侧区域块2 */}
              <div
                className="relative mt-25px w-472px h-342px bg-no-repeat"
                style={{ backgroundImage: `url(${rightBg2Url})` }}
              >
                <div className="absolute left-0 top-50px right-0 bottom-0">
                  <ReactEChartsCore
                    className="h-full!"
                    echarts={echarts}
                    opts={{ renderer: 'svg' }}
                    option={chartRight1}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* footer */}
          <div className="flex justify-center">
            <img className="w-1800px" src={footerBgUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
