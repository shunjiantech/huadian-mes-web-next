import { atom } from 'recoil'

const key = 'permissionsState'

const permissionsState = atom<string[]>({
  key,
  default: [],
})

export default permissionsState
