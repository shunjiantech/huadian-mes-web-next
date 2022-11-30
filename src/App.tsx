import 'dayjs/locale/zh-cn'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { BrowserRouter, Link, useRoutes } from 'react-router-dom'

import routes from '@/routes'

const Routes = () => {
  const element = useRoutes(routes)

  return <>{element}</>
}

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <div>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </div>
        <Routes />
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
