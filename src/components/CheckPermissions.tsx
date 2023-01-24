import _ from 'lodash-es'
import { useRecoilValue } from 'recoil'

import userPermissionsState from '@/store/userPermissionsState'

const CheckPermissions = (
  props: React.PropsWithChildren<{
    include?: string[]
    exclude?: string[]
    fallback?: React.ReactNode
  }>,
) => {
  const userPermissions = useRecoilValue(userPermissionsState)

  if (
    props.exclude &&
    props.exclude.length > 0 &&
    _.intersection(userPermissions, props.exclude).length > 0
  ) {
    return <>{props.fallback}</>
  }

  if (
    props.include &&
    props.include.length > 0 &&
    _.intersection(userPermissions, props.include).length === 0
  ) {
    return <>{props.fallback}</>
  }

  return <>{props.children}</>
}

export default CheckPermissions
