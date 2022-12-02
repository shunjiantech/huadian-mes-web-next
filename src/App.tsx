import 'dayjs/locale/zh-cn'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { RecoilRoot } from 'recoil'

import routes from '@/routes'

const Routes = () => {
  const element = useRoutes(routes)

  return <>{element}</>
}

const App = () => {
  return (
    <RecoilRoot>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </ConfigProvider>
    </RecoilRoot>
  )
}

export default App
