import { ProLayout } from '@ant-design/pro-layout'
import { Route } from '@ant-design/pro-layout/lib/typings'
import _ from 'lodash-es'
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import logo from '@/assets/logo.svg'
import config from '@/config'
import BlankLayout from '@/layouts/BlankLayout'
import routes, { RouteObjectExt } from '@/routes'
import permissionsState from '@/store/permissionsState'

export const headerHeight = 48

const genRoutes = (
  routes: RouteObjectExt[],
  permissions: string[],
  parentPath = '/',
): Route[] => {
  return routes
    .filter(({ permissions: routePermissions }) => {
      if (
        routePermissions &&
        routePermissions.exclude &&
        routePermissions.exclude.length > 0 &&
        _.intersection(permissions, routePermissions.exclude).length > 0
      ) {
        return false
      }
      if (
        routePermissions &&
        routePermissions.include &&
        routePermissions.include.length > 0 &&
        _.intersection(permissions, routePermissions.include).length === 0
      ) {
        return false
      }
      return true
    })
    .map(({ path = '', menu, children }) => {
      // fix ProLayout: the menu does not display when path = ''
      const fullPath = path.startsWith('/')
        ? path
        : `${parentPath}${path && (parentPath.endsWith('/') ? '' : '/')}${path}`
      const route: Route = {
        path: fullPath,
        ...menu,
      }
      if (children) {
        route.routes = genRoutes(children, permissions, fullPath)
      }
      return route
    })
}

const Layout = () => {
  const location = useLocation()

  const permissions = useRecoilValue(permissionsState)

  const layoutRoutes = useMemo(
    () => genRoutes(routes, permissions),
    [permissions],
  )

  return (
    <ProLayout
      className="!min-h-screen"
      locale="zh-CN"
      layout="mix"
      logo={logo}
      title={config.TITLE}
      headerHeight={headerHeight}
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
