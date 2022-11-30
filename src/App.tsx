import 'dayjs/locale/zh-cn'

import { Button, ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { useState } from 'react'

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <ConfigProvider locale={zhCN}>
      <Button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </Button>
    </ConfigProvider>
  )
}

export default App
