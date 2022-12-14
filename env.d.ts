/// <reference types="vite/client" />

declare const __APP_NAME__: string
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_TITLE?: string
  readonly VITE_API_BASEURL?: string
  readonly VITE_API_TIMEOUT?: string
  readonly SSO_CLIENT_ID?: string
  readonly SSO_OAUTH_URL?: string
}

interface ImportMeta {
  readonly env: Partial<ImportMetaEnv>
}

// replace moment to dayjs
declare module 'moment' {
  import { Dayjs } from 'dayjs'
  namespace moment {
    type Moment = Dayjs
  }
  export = moment
  export as namespace moment
}
