import { Spin } from 'antd'
import React, { Suspense } from 'react'
import { RouteObject } from 'react-router-dom'

import CheckToken from '@/components/CheckToken'

const genEl = (Component: React.ComponentType) => {
  return <Component />
}

const genLazyEl = (factory: Parameters<typeof React.lazy>[0]) => {
  return (
    <Suspense
      fallback={
        <div className="h-full flex justify-center items-center">
          <Spin />
        </div>
      }
    >
      {genEl(React.lazy(factory))}
    </Suspense>
  )
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <CheckToken
        needToken={true}
        fallbackEffect={({ navigate }) => {
          navigate('/login')
        }}
      >
        {genLazyEl(() => import('@/layouts/AdminLayout'))}
      </CheckToken>
    ),
    children: [
      {
        path: '/',
        element: genLazyEl(() => import('@/pages/Home')),
      },
      {
        path: '/about',
        element: genLazyEl(() => import('@/pages/About')),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <CheckToken
        needToken={false}
        fallbackEffect={({ navigate }) => {
          navigate('/')
        }}
      >
        {genLazyEl(() => import('@/pages/Login'))}
      </CheckToken>
    ),
  },
]

export default routes
