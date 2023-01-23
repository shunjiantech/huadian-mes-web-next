import { IUploadProps, Upload as FormilyAntdUpload } from '@formily/antd'

import { getFullApiURL } from '@/utils/getURL'
import { getBearerToken } from '@/utils/request'

export type Props = React.PropsWithChildren<IUploadProps>

const Upload = (props: Props) => {
  const { children, ...pureProps } = props

  return (
    <FormilyAntdUpload
      {...pureProps}
      action={getFullApiURL('/api/v1/uploads')}
      headers={{
        'X-Requested-With': null as unknown as string,
        Authorization: getBearerToken(),
      }}
    >
      {children}
    </FormilyAntdUpload>
  )
}

export default Upload
