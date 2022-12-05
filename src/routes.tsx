import { HomeOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { MenuDataItem } from '@ant-design/pro-layout'
import { Spin } from 'antd'
import React, { Suspense } from 'react'
import { RouteObject as _RouteObject } from 'react-router-dom'

import CheckPermissions from '@/components/CheckPermissions'
import CheckToken from '@/components/CheckToken'

export type RouteObject = _RouteObject & {
  menu?: MenuDataItem
  children?: RouteObject[]
}

const createRouteElement = (Component: React.ComponentType) => {
  return <Component />
}

const createLazyRouteElement = (factory: Parameters<typeof React.lazy>[0]) => {
  return (
    <Suspense
      fallback={
        <div className="h-full flex justify-center items-center">
          <Spin />
        </div>
      }
    >
      {createRouteElement(React.lazy(factory))}
    </Suspense>
  )
}

const Forbidden = React.lazy(() => import('@/pages/Forbidden'))

const routes: RouteObject[] = [
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
        {createLazyRouteElement(() => import('@/layouts/AdminLayout'))}
      </CheckToken>
    ),
    children: [
      {
        path: '',
        menu: {
          icon: <HomeOutlined />,
          name: '首页',
        },
        element: (
          <CheckPermissions fallback={<Forbidden />}>
            {createLazyRouteElement(() => import('@/pages/Home'))}
          </CheckPermissions>
        ),
      },
      {
        path: 'about',
        menu: {
          icon: <InfoCircleOutlined />,
          name: '关于',
        },
        element: (
          <CheckPermissions fallback={<Forbidden />}>
            {createLazyRouteElement(() => import('@/pages/About'))}
          </CheckPermissions>
        ),
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
        {createLazyRouteElement(() => import('@/pages/Login'))}
      </CheckToken>
    ),
  },
]

export default routes
