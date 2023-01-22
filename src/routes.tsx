import {
  CarryOutOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  FileExclamationOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { MenuDataItem } from '@ant-design/pro-layout'
import { Spin } from 'antd'
import React, { Suspense } from 'react'
import { IndexRouteObject, NonIndexRouteObject } from 'react-router-dom'

import CheckPermissions from '@/components/CheckPermissions'
import CheckToken from '@/components/CheckToken'

export interface IndexRouteObjectExt extends IndexRouteObject {
  menu?: MenuDataItem
  permissions?: {
    include?: string[]
    exclude?: string[]
  }
}
export interface NonIndexRouteObjectExt extends NonIndexRouteObject {
  menu?: MenuDataItem
  permissions?: {
    include?: string[]
    exclude?: string[]
  }
  children?: RouteObjectExt[]
}

export type RouteObjectExt = IndexRouteObjectExt | NonIndexRouteObjectExt

const Forbidden = React.lazy(() => import('@/pages/common/Forbidden'))
const NotFound = React.lazy(() => import('@/pages/common/NotFound'))

const createLazyEl = (factory: Parameters<typeof React.lazy>[0]) => {
  const Comp = React.lazy(factory)
  return (
    <Suspense
      fallback={
        <div className="h-full flex justify-center items-center">
          <Spin />
        </div>
      }
    >
      <Comp />
    </Suspense>
  )
}

const routes: RouteObjectExt[] = [
  {
    path: '/dashboard',
    menu: {
      flatMenu: true,
    },
    element: (
      <CheckToken
        needToken={true}
        fallbackEffect={({ navigate, location }) => {
          navigate(
            `/login?redirect=${encodeURIComponent(
              `${location.pathname}${location.search}`,
            )}`,
          )
        }}
      >
        {createLazyEl(() => import('@/layouts/BlankLayout'))}
      </CheckToken>
    ),
    children: [
      {
        path: '',
        menu: {
          icon: <DashboardOutlined />,
          name: '大屏统计',
        },
        element: (
          <CheckPermissions fallback={<Forbidden />}>
            {createLazyEl(() => import('@/pages/Dashboard'))}
          </CheckPermissions>
        ),
      },
    ],
  },
  {
    path: '/',
    menu: {
      flatMenu: true,
    },
    element: (
      <CheckToken
        needToken={true}
        fallbackEffect={({ navigate, location }) => {
          navigate(
            `/login?redirect=${encodeURIComponent(
              `${location.pathname}${location.search}`,
            )}`,
          )
        }}
      >
        {createLazyEl(() => import('@/layouts/AdminLayout'))}
      </CheckToken>
    ),
    children: [
      {
        path: 'workbench',
        menu: {
          icon: <CarryOutOutlined />,
          name: '个人中心',
        },
        element: (
          <CheckPermissions fallback={<Forbidden />}>
            {createLazyEl(() => import('@/layouts/BlankLayout'))}
          </CheckPermissions>
        ),
        children: [
          {
            path: 'task',
            menu: {
              flatMenu: true,
            },
            element: (
              <CheckPermissions fallback={<Forbidden />}>
                {createLazyEl(() => import('@/layouts/BlankLayout'))}
              </CheckPermissions>
            ),
            children: [
              {
                path: 'list',
                menu: {
                  name: '任务列表',
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(() => import('@/pages/workbench/task/List'))}
                  </CheckPermissions>
                ),
              },
              {
                path: ':device_id',
                menu: {
                  name: '任务列表',
                  hideInMenu: true,
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(() => import('@/layouts/BlankLayout'))}
                  </CheckPermissions>
                ),
                children: [
                  {
                    path: 'action_record',
                    menu: {
                      name: '历史流程',
                    },
                    element: (
                      <CheckPermissions fallback={<Forbidden />}>
                        {createLazyEl(
                          () =>
                            import('@/pages/workbench/task/TaskActionRecord'),
                        )}
                      </CheckPermissions>
                    ),
                  },
                ],
              },
              {
                path: 'my_action_record',
                menu: {
                  name: '操作记录',
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(
                      () => import('@/pages/workbench/task/MyActionRecord'),
                    )}
                  </CheckPermissions>
                ),
              },
              {
                path: 'do',
                menu: {
                  name: '试验测试',
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(() => import('@/pages/workbench/task/Do'))}
                  </CheckPermissions>
                ),
              },
            ],
          },
        ],
      },
      {
        path: 'test-info',
        menu: {
          icon: <ExperimentOutlined />,
          name: '试验信息管理',
        },
        element: (
          <CheckPermissions fallback={<Forbidden />}>
            {createLazyEl(() => import('@/layouts/BlankLayout'))}
          </CheckPermissions>
        ),
        children: [
          {
            path: 'test-plan',
            menu: {
              flatMenu: true,
            },
            element: (
              <CheckPermissions fallback={<Forbidden />}>
                {createLazyEl(() => import('@/layouts/BlankLayout'))}
              </CheckPermissions>
            ),
            children: [
              {
                path: 'list',
                menu: {
                  name: '试验方案设置',
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(
                      () => import('@/pages/testInfo/testPlan/List'),
                    )}
                  </CheckPermissions>
                ),
              },
            ],
          },
          {
            path: 'test-item',
            menu: {
              flatMenu: true,
            },
            element: (
              <CheckPermissions fallback={<Forbidden />}>
                {createLazyEl(() => import('@/layouts/BlankLayout'))}
              </CheckPermissions>
            ),
            children: [
              {
                path: 'list',
                menu: {
                  name: '试验项目设置',
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(
                      () => import('@/pages/testInfo/testItem/List'),
                    )}
                  </CheckPermissions>
                ),
              },
              {
                path: ':id',
                menu: {
                  name: '试验项目设置',
                  hideInMenu: true,
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(
                      () =>
                        import('@/pages/testInfo/testItem/ChildPageContainer'),
                    )}
                  </CheckPermissions>
                ),
                children: [
                  {
                    path: 'field/list',
                    menu: {
                      name: '试验项目字段',
                    },
                    element: (
                      <CheckPermissions fallback={<Forbidden />}>
                        {createLazyEl(
                          () => import('@/pages/testInfo/testItem/FieldList'),
                        )}
                      </CheckPermissions>
                    ),
                  },
                  {
                    path: 'layout/editor',
                    menu: {
                      name: '试验页面布局',
                    },
                    element: (
                      <CheckPermissions fallback={<Forbidden />}>
                        {createLazyEl(
                          () =>
                            import('@/pages/testInfo/testItem/LayoutEditor'),
                        )}
                      </CheckPermissions>
                    ),
                  },
                ],
              },
            ],
          },
          {
            path: 'producer',
            menu: {
              flatMenu: true,
            },
            element: (
              <CheckPermissions fallback={<Forbidden />}>
                {createLazyEl(() => import('@/layouts/BlankLayout'))}
              </CheckPermissions>
            ),
            children: [
              {
                path: 'list',
                menu: {
                  name: '生产厂家设置',
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(
                      () => import('@/pages/testInfo/producer/List'),
                    )}
                  </CheckPermissions>
                ),
              },
            ],
          },
          {
            path: 'customer',
            menu: {
              flatMenu: true,
            },
            element: (
              <CheckPermissions fallback={<Forbidden />}>
                {createLazyEl(() => import('@/layouts/BlankLayout'))}
              </CheckPermissions>
            ),
            children: [
              {
                path: 'list',
                menu: {
                  name: '委托单位设置',
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(
                      () => import('@/pages/testInfo/customer/List'),
                    )}
                  </CheckPermissions>
                ),
              },
            ],
          },
        ],
      },
      {
        path: 'laboratory-info',
        menu: {
          icon: <FileExclamationOutlined />,
          name: '实验室信息管理',
        },
        element: (
          <CheckPermissions fallback={<Forbidden />}>
            {createLazyEl(() => import('@/layouts/BlankLayout'))}
          </CheckPermissions>
        ),
        children: [
          {
            path: 'standard',
            menu: {
              flatMenu: true,
            },
            element: (
              <CheckPermissions fallback={<Forbidden />}>
                {createLazyEl(() => import('@/layouts/BlankLayout'))}
              </CheckPermissions>
            ),
            children: [
              {
                path: 'list',
                menu: {
                  name: '国家标准设置',
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(
                      () => import('@/pages/laboratoryInfo/standard/List'),
                    )}
                  </CheckPermissions>
                ),
              },
            ],
          },
        ],
      },
      {
        path: 'system-settings',
        menu: {
          icon: <SettingOutlined />,
          name: '系统设置',
        },
        element: (
          <CheckPermissions fallback={<Forbidden />}>
            {createLazyEl(() => import('@/layouts/BlankLayout'))}
          </CheckPermissions>
        ),
        children: [
          {
            path: 'department',
            menu: {
              flatMenu: true,
            },
            element: (
              <CheckPermissions fallback={<Forbidden />}>
                {createLazyEl(() => import('@/layouts/BlankLayout'))}
              </CheckPermissions>
            ),
            children: [
              {
                path: 'list',
                menu: {
                  name: '部门管理',
                },
                element: (
                  <CheckPermissions fallback={<Forbidden />}>
                    {createLazyEl(
                      () => import('@/pages/systemSettings/department/List'),
                    )}
                  </CheckPermissions>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: (
      <CheckToken
        needToken={false}
        fallbackEffect={({ navigate, location }) => {
          const redirect = new URLSearchParams(location.search).get('redirect')
          navigate(redirect ? decodeURIComponent(redirect) : '/')
        }}
      >
        {createLazyEl(() => import('@/pages/Login'))}
      </CheckToken>
    ),
  },
  {
    path: '*',
    element: (
      <CheckToken
        needToken={false}
        fallback={createLazyEl(() => import('@/layouts/AdminLayout'))}
      >
        {createLazyEl(() => import('@/layouts/BlankLayout'))}
      </CheckToken>
    ),
    children: [
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]

export default routes
