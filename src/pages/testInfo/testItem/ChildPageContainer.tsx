import { PageContainer } from '@ant-design/pro-layout'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const ChildPageContainer = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <PageContainer
      tabActiveKey={/.*\/(.*?)$/.exec(location.pathname)?.[1]}
      tabList={[]}
      tabProps={{
        items: [{ label: '试验页面编辑', key: 'designable' }],
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
