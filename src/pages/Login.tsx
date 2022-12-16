import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Form, FormItem, Input, Password, Submit } from '@formily/antd'
import { createForm } from '@formily/core'
import { createSchemaField } from '@formily/react'
import { Button, Card, Result, Spin, Tabs } from 'antd'
import _ from 'lodash-es'
import queryString from 'query-string'
import { createElement, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'

import tokenState from '@/store/tokenState'
import request from '@/utils/request'
import { redirectToSSOLogin, redirectToSSOLogout } from '@/utils/sso'

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Password,
  },
  scope: {
    createElement,
    UserOutlined,
    LockOutlined,
  },
})

const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        prefix: '{{createElement(UserOutlined)}}',
      },
    },
    password: {
      type: 'string',
      title: '密码',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Password',
      'x-component-props': {
        prefix: '{{createElement(LockOutlined)}}',
      },
    },
  },
}

const Login = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const form = useMemo(() => createForm(), [])

  const setToken = useSetRecoilState(tokenState)

  const query = useMemo(() => queryString.parse(location.search), [location])

  const [ssoLoginErr, setSsoLoginErr] = useState<never>()

  const login = async () => {
    try {
      const response = await request({
        method: 'POST',
        url: '/api/v1/users/login',
        data: {
          code: query.code,
          redirect_uri: `${window.location.origin}${
            window.location.pathname
          }?${queryString.stringify(_.omit(query, 'code'))}`,
        },
      })
      if (!response.data?.data?.token) {
        throw response.data.message
      }
      setToken(response.data.data.token)
    } catch (err) {
      setSsoLoginErr(err as never)
    }
  }

  useMemo(() => {
    if (!query.code) {
      redirectToSSOLogin(window.location.href)
      return
    }
    login()
  }, [query])

  if (query.code) {
    if (ssoLoginErr) {
      return (
        <Result
          status="error"
          title="授权失败"
          subTitle={ssoLoginErr}
          extra={[
            <Button
              type="primary"
              key="retry"
              onClick={() => {
                navigate(
                  `${location.pathname}?${queryString.stringify(
                    _.omit(query, 'code'),
                  )}`,
                )
              }}
            >
              重试授权
            </Button>,
            <Button
              key="logout"
              onClick={() => {
                redirectToSSOLogout(
                  `${window.location.origin}${
                    window.location.pathname
                  }?${queryString.stringify(_.omit(query, 'code'))}`,
                )
              }}
            >
              注销登录
            </Button>,
          ]}
        />
      )
    }
    return (
      <div className="h-full flex justify-center items-center">
        <Spin />
      </div>
    )
  }
  return null

  return (
    <div className="bg-#eee h-full flex justify-center items-center">
      <Card className="w-400px">
        <Tabs
          className="!m-t--10px"
          items={[
            {
              label: '账号登录',
              key: 'login',
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  size="large"
                  onAutoSubmit={async (e) => {
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    setToken(`${e.username}:${e.password}`)
                  }}
                >
                  <SchemaField schema={schema} />
                  <Submit size="large" block>
                    登录
                  </Submit>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default Login
