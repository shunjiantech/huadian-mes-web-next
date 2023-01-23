import { UploadFile } from 'antd'
import _ from 'lodash-es'

export type Key = string | { key: string; onlyOneFlat: boolean }

const getKey = (key: Key) => {
  if (typeof key === 'string') {
    return {
      key,
      onlyOneFlat: false,
    }
  }
  return key
}

const getValue = (
  obj: unknown | unknown[],
  onlyOneFlat: boolean,
  reverse = false,
) => {
  if (onlyOneFlat) {
    if (reverse) {
      if (!(obj instanceof Array)) {
        return obj ? [obj] : []
      }
    } else {
      if (obj instanceof Array) {
        if (obj.length === 0) {
          return ''
        } else if (obj.length === 1) {
          return obj[0]
        }
      }
    }
  }
  return obj
}

export const filesToPaths = (obj: unknown, keys: Key[]) => {
  keys.forEach((item) => {
    const { key, onlyOneFlat } = getKey(item)
    const files: UploadFile[] = _.get(obj, key, [])
    const paths: string[] = files.map((file) => file.response?.data?.path)
    const urls: string[] = files.map((file) => file.response?.data?.url)
    _.set(obj as never, key, getValue(paths, onlyOneFlat))
    _.set(obj as never, `${key}_url`, getValue(urls, onlyOneFlat))
  })
}

export const pathsToFiles = (obj: unknown, keys: Key[]) => {
  keys.forEach((item) => {
    const { key, onlyOneFlat } = getKey(item)
    const paths: string[] = getValue(_.get(obj, key, []), onlyOneFlat, true)
    const urls: string[] = getValue(
      _.get(obj, `${key}_url`, []),
      onlyOneFlat,
      true,
    )
    const files = paths.map((path, index): UploadFile => {
      const url = urls[index]
      return {
        uid: `${Math.random()}`,
        name: path.split(/[/\\]/).reverse()[0],
        response: {
          data: {
            path,
            url,
          },
        },
        thumbUrl: url,
        url,
      }
    })
    _.set(obj as never, key, files)
  })
  removeUrlField(obj, keys)
}

export const removeUrlField = (obj: unknown, keys: Key[]) => {
  keys.forEach((item) => {
    const { key } = getKey(item)
    _.unset(obj as never, `${key}_url`)
  })
}
