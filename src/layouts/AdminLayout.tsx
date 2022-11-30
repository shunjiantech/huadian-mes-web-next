import { ProLayout } from '@ant-design/pro-layout'
import { Link, Outlet, useLocation } from 'react-router-dom'

import config from '@/config'

const Layout = () => {
  const location = useLocation()

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
        routes: [
          {
            name: 'Home',
            path: '/',
          },
          {
            name: 'About',
            path: '/about',
          },
        ],
      }}
      menuItemRender={(item, dom) => <Link to={item.path ?? '/'}>{dom}</Link>}
    >
      <Outlet />
    </ProLayout>
  )
}

export default Layout
