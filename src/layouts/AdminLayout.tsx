import { ProLayout } from '@ant-design/pro-layout'
import { Route } from '@ant-design/pro-layout/lib/typings'
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

import config from '@/config'
import BlankLayout from '@/layouts/BlankLayout'
import routes, { RouteObject } from '@/routes'

const genRoutes = (routes: RouteObject[], parentPath = '/'): Route[] => {
  return routes.map(({ path = '', menu, children }) => {
    // fix ProLayout: the menu does not display when path = ''
    const fullPath = path.startsWith('/')
      ? path
      : `${parentPath}${path && (parentPath.endsWith('/') ? '' : '/')}${path}`
    const route: Route = {
      path: fullPath,
      ...menu,
    }
    if (children) {
      route.routes = genRoutes(children, fullPath)
    }
    return route
  })
}

const Layout = () => {
  const location = useLocation()

  const layoutRoutes = useMemo(() => genRoutes(routes), [])

  return (
    <ProLayout
      className="!min-h-screen"
      locale="zh-CN"
      layout="mix"
      logo={null}
      title={config.TITLE}
      fixedHeader
      fixSiderbar
      location={{
        pathname: location.pathname,
      }}
      route={{
        routes: layoutRoutes,
      }}
      menuItemRender={(item, dom) => <Link to={item.path ?? '/'}>{dom}</Link>}
    >
      <BlankLayout />
    </ProLayout>
  )
}

export default Layout
