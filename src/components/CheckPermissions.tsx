import _ from 'lodash-es'
import { useRecoilValue } from 'recoil'

import permissionsState from '@/store/permissionsState'

const CheckPermissions = (
  props: React.PropsWithChildren<{
    include?: string[]
    exclude?: string[]
    fallback?: React.ReactNode
  }>,
) => {
  const permissions = useRecoilValue(permissionsState)

  if (
    props.exclude &&
    props.exclude.length > 0 &&
    _.intersection(permissions, props.exclude).length > 0
  ) {
    return <>{props.fallback}</>
  }

  if (
    props.include &&
    props.include.length > 0 &&
    _.intersection(permissions, props.include).length === 0
  ) {
    return <>{props.fallback}</>
  }

  return <>{props.children}</>
}

export default CheckPermissions
