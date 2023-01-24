import { atom } from 'recoil'

const key = 'userPermissionsState'

const userPermissionsState = atom<string[]>({
  key,
  default: [],
})

export default userPermissionsState
