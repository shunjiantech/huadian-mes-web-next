import { Spin } from 'antd'
import React, { Suspense } from 'react'
import { RouteObject } from 'react-router-dom'

import CheckToken from '@/components/CheckToken'

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
        {createLazyRouteElement(() => import('@/layouts/AdminLayout'))}
      </CheckToken>
    ),
    children: [
      {
        path: '/',
        element: createLazyRouteElement(() => import('@/pages/Home')),
      },
      {
        path: '/about',
        element: createLazyRouteElement(() => import('@/pages/About')),
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
        {createLazyRouteElement(() => import('@/pages/Login'))}
      </CheckToken>
    ),
  },
]

export default routes
