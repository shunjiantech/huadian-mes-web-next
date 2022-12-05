import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

const Forbidden = (props: Parameters<typeof Result>[0]) => {
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col justify-center">
      <Result
        {...props}
        status={props.status ?? '403'}
        title={props.title ?? '403'}
        subTitle={props.subTitle ?? '抱歉，您无权访问此页面。'}
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

export default Forbidden
