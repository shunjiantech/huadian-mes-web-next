import { RouteObject } from 'react-router-dom'

import AdminLayout from '@/layouts/AdminLayout'
import About from '@/pages/About'
import Home from '@/pages/Home'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/about',
        element: <About />,
      },
    ],
  },
]
export default routes
