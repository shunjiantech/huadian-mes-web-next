import crypto from 'crypto-js'
import queryString from 'query-string'

import config from '@/config'

const getSearch = (mode: 'login' | 'logout', redirect_uri: string) => {
  return queryString.stringify({
    client: encodeURIComponent(
      crypto.enc.Base64.stringify(
        crypto.enc.Utf8.parse(
          JSON.stringify({
            client_id: config.SSO_CLIENT_ID,
            redirect_uri,
            app_title: config.TITLE,
          }),
        ),
      ),
    ),
    logout: mode === 'logout' ? 1 : undefined,
  })
}

export const redirectToSSOLogin = (redirect_uri: string) => {
  window.location.href = `${config.SSO_OAUTH_URL}${getSearch(
    'login',
    redirect_uri,
  )}`
}

export const redirectToSSOLogout = (redirect_uri: string) => {
  window.location.href = `${config.SSO_OAUTH_URL}${getSearch(
    'logout',
    redirect_uri,
  )}`
}
