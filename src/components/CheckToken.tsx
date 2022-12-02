import React, { useEffect } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import tokenState from '@/store/tokenState'

const CheckToken = (
  props: React.PropsWithChildren<{
    needToken: boolean
    fallback?: React.ReactNode
    fallbackEffect?: (params: {
      navigate: NavigateFunction
      token: string
      withToken: boolean
    }) => void
  }>,
) => {
  const navigate = useNavigate()
  const token = useRecoilValue(tokenState)

  useEffect(() => {
    if (Number(!!token) ^ Number(props.needToken)) {
      props.fallbackEffect?.({
        navigate,
        token,
        withToken: props.needToken,
      })
    }
  }, [token, props.needToken])

  if (Number(!!token) ^ Number(props.needToken)) {
    return <>{props.fallback}</>
  }

  return <>{props.children}</>
}

export default CheckToken
