import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

const NotFound = (props: Parameters<typeof Result>[0]) => {
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col justify-center">
      <Result
        {...props}
        status={props.status ?? '404'}
        title={props.title ?? '404'}
        subTitle={props.subTitle ?? '抱歉，您访问的页面不存在。'}
        extra={
          props.extra ?? (
            <Button
              type="primary"
              onClick={() => {
                navigate('/')
              }}
            >
              回到首页
            </Button>
          )
        }
      />
    </div>
  )
}

export default NotFound
