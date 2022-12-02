import { HomeOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { ProLayout } from '@ant-design/pro-layout'
import { Link, useLocation } from 'react-router-dom'

import config from '@/config'
import BlankLayout from '@/layouts/BlankLayout'

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
            icon: <HomeOutlined />,
            name: 'Home',
            path: '/',
          },
          {
            icon: <InfoCircleOutlined />,
            name: 'About',
            path: '/about',
          },
        ],
      }}
      menuItemRender={(item, dom) => <Link to={item.path ?? '/'}>{dom}</Link>}
    >
      <BlankLayout />
    </ProLayout>
  )
}

export default Layout
