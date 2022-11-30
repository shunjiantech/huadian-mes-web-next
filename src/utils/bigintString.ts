/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash-es'

const bigIntStrPrefix = '__bigint__'
const bigIntStrTestReg = new RegExp(`^${bigIntStrPrefix}\\d+$`)

const isBigInt = (value: any) => typeof value === 'bigint'
const isBigIntStr = (value: any) =>
  typeof value === 'string' && bigIntStrTestReg.test(value)

export const bigIntToString = (value: any) => {
  if (isBigInt(value)) {
    return `${bigIntStrPrefix}${value}`
  }
  return value
}

export const stringToBigInt = (value: any) => {
  if (isBigIntStr(value)) {
    return BigInt(value.slice(bigIntStrPrefix.length))
  }
  return value
}

export const urlStringToBigInt = (url: string) => {
  const arr = url.split('/')
  arr.forEach((value, index) => {
    if (isBigIntStr(value)) {
      arr[index] = value.slice(bigIntStrPrefix.length)
    }
  })
  return arr.join('/')
}

const recursion = (
  value: any,
  callback: (path: (string | number)[]) => void,
  path: (string | number)[] = [],
): any => {
  if (_.isArray(value)) {
    return value.map((item, key) => {
      return recursion(item, callback, [...path, key])
    })
  }
  if (_.isObject(value)) {
    return _.keys(value).map((key) => {
      const item = (value as any)[key]
      return recursion(item, callback, [...path, key])
    })
  }
  return callback(path)
}

export const recursionBigIntToString = (value: any) => {
  const paths = _.flattenDeep<string>(
    recursion(value, (path) => {
      return isBigInt(_.get(value, path)) ? path.join('.') : null
    }),
  ).filter((item) => item)
  const newValue = _.cloneDeep(value)
  paths.forEach((path) => {
    _.set(newValue, path, bigIntToString(_.get(newValue, path)))
  })
  return newValue
}

export const recursionStringToBigInt = (value: any) => {
  const paths = _.flattenDeep<string>(
    recursion(value, (path) => {
      return isBigIntStr(_.get(value, path)) ? path.join('.') : null
    }),
  ).filter((item) => item)
  const newValue = _.cloneDeep(value)
  paths.forEach((path) => {
    _.set(newValue, path, stringToBigInt(_.get(newValue, path)))
  })
  return newValue
}
