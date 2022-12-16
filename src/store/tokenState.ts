import { atom } from 'recoil'

import storageEffect from '@/store/storageEffect'

export let token = ''

const setToken = (newValue: unknown) => {
  if (typeof newValue === 'string') {
    token = newValue
  } else {
    token = ''
  }
}

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
    ({ onSet, getLoadable }) => {
      setToken(getLoadable(tokenState).contents)
      onSet(setToken)
    },
  ],
})

export default tokenState
