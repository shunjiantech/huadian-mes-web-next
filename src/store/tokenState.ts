import { atom } from 'recoil'

import storageEffect from '@/store/storageEffect'

const key = 'tokenState'

const tokenState = atom<string>({
  key,
  default: '',
  effects: [
    storageEffect({
      key,
      storage: sessionStorage,
      restorer: (value, defaultValue) => {
        return typeof value === 'string' ? value : defaultValue
      },
    }),
  ],
})

export default tokenState
