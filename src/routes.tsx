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
        {createLazyEl(() => import('@/layouts/AdminLayout'))}
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
            {createLazyEl(() => import('@/pages/Home'))}
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
            {createLazyEl(() => import('@/pages/About'))}
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
