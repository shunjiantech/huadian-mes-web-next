import { AtomEffect, DefaultValue } from 'recoil'

type PersistenceOptions<T> = {
  key: string
  storage: Storage
  restorer: (mixed: T, DefaultValue: DefaultValue) => T | DefaultValue
}

const storageEffect =
  <T>(options: PersistenceOptions<T>): AtomEffect<T> =>
  ({ setSelf, onSet }) => {
    const savedValue = options.storage.getItem(options.key)
    if (savedValue !== null) {
      try {
        setSelf(options.restorer(JSON.parse(savedValue), new DefaultValue()))
      } catch (err) {
        // default value unchanged
      }
    }

    onSet((newValue: unknown) => {
      if (newValue instanceof DefaultValue) {
        options.storage.removeItem(options.key)
      } else {
        options.storage.setItem(options.key, JSON.stringify(newValue))
      }
    })
  }

export default storageEffect
