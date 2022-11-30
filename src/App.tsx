import 'dayjs/locale/zh-cn'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { BrowserRouter, useRoutes } from 'react-router-dom'

import routes from '@/routes'

const Routes = () => {
  const element = useRoutes(routes)

  return <>{element}</>
}

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
