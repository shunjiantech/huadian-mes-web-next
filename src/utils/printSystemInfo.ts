import config from '@/config'

const info: {
  key: string
  value: string
}[] = [
  {
    key: 'SYSTEM',
    value: __APP_NAME__,
  },
  {
    key: 'VERSION',
    value: `v${__APP_VERSION__}`,
  },
  {
    key: 'API_URL',
    value: config.API_BASEURL || '/',
  },
]

const infoLongestKeyLen = Math.max(...info.map(({ key }) => key.length))

info.forEach(({ key, value }) => {
  console.log(
    `%c ${key.padEnd(infoLongestKeyLen, ' ')} %c ${value} `,
    `font-size: 18px; font-weight: bold; background: #52c41a; color: #fff; padding: 4px 0 4px 4px; border-radius: 99px 0 0 99px;`,
    `font-size: 18px; font-weight: bold; background: #d9f7be; color: #000; padding: 4px 4px 4px 0; border-radius: 0 99px 99px 0;`,
  )
})
