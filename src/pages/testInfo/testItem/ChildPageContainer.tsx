import { PageContainer } from '@ant-design/pro-layout'
import { TabsProps } from 'antd'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const items: TabsProps['items'] = [
  { label: '试验页面布局', key: 'layout/editor' },
]

const ChildPageContainer = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const tabActiveKey = useMemo(
    () => items.find(({ key }) => location.pathname.endsWith(key))?.key ?? '',
    [location.pathname],
  )

  return (
    <PageContainer
      tabActiveKey={tabActiveKey}
      tabList={[]}
      tabProps={{
        items,
      }}
      onTabChange={(key) => {
        navigate(key)
      }}
    >
      <Outlet />
    </PageContainer>
  )
}

export default ChildPageContainer
