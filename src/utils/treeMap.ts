/* eslint-disable @typescript-eslint/no-explicit-any */
const treeMap = (
  arr: any,
  callbackfn: (value: any) => any,
  childrenKey = 'children',
): any => {
  return arr.map((value: any) => {
    const newValue = { ...value }
    if (newValue[childrenKey] && newValue[childrenKey] instanceof Array) {
      newValue[childrenKey] = treeMap(
        newValue[childrenKey],
        callbackfn,
        childrenKey,
      )
    }
    return callbackfn(newValue)
  })
}

export default treeMap
