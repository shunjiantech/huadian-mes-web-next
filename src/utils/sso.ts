import crypto from 'crypto-js'
import queryString from 'query-string'

import config from '@/config'

const getSearch = (mode: 'login' | 'logout') => {
  return queryString.stringify({
    client: encodeURIComponent(
      crypto.enc.Base64.stringify(
        crypto.enc.Utf8.parse(
          JSON.stringify({
            client_id: config.SSO_CLIENT_ID,
            redirect_uri: window.location.href,
            app_title: config.TITLE,
          }),
        ),
      ),
    ),
    logout: mode === 'logout' ? 1 : undefined,
  })
}

export const loginURL = `${config.SSO_OAUTH_URL}${getSearch('login')}`
export const logoutURL = `${config.SSO_OAUTH_URL}${getSearch('logout')}`

export const redirectToSSOLogin = () => {
  window.location.href = loginURL
}

export const redirectToSSOLogout = () => {
  window.location.href = logoutURL
}
