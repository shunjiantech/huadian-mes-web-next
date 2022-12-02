import React, { useEffect } from 'react'
import {
  Location,
  NavigateFunction,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import tokenState from '@/store/tokenState'

const CheckToken = (
  props: React.PropsWithChildren<{
    needToken: boolean
    fallback?: React.ReactNode
    fallbackEffect?: (params: {
      navigate: NavigateFunction
      location: Location
      token: string
      withToken: boolean
    }) => void
  }>,
) => {
  const navigate = useNavigate()
  const location = useLocation()

  const token = useRecoilValue(tokenState)

  useEffect(() => {
    if (Number(!!token) ^ Number(props.needToken)) {
      props.fallbackEffect?.({
        navigate,
        location,
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
