import { Spin } from 'antd'
import React, { lazy, Suspense } from 'react'
import { RouteObject } from 'react-router-dom'

const genEl = (Component: React.ComponentType) => {
  return <Component />
}

const genLazyEl = (factory: Parameters<typeof lazy>[0]) => {
  return (
    <Suspense
      fallback={
        <div className="h-full flex justify-center items-center">
          <Spin />
        </div>
      }
    >
      {genEl(lazy(factory))}
    </Suspense>
  )
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: genLazyEl(() => import('@/layouts/AdminLayout')),
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
]

export default routes
