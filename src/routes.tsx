import { RouteObject } from 'react-router-dom'

import About from '@/pages/About'
import Home from '@/pages/Home'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home></Home>,
  },
  {
    path: '/about',
    element: <About></About>,
  },
]
export default routes
