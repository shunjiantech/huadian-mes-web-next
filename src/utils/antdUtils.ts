import { TreeSelectProps } from 'antd'

export const filterTreeNodeTitle: TreeSelectProps['filterTreeNode'] = (
  inputValue,
  treeNode,
) => {
  return (
    typeof treeNode.title === 'string' && treeNode.title.includes(inputValue)
  )
}

export const numberParser = {
  int: (value: string) => value.replace(/[^\d]+/g, ''),
  float: (value: string) =>
    value
      .replace(/([^\d.]+|)/g, '')
      .replace(/(?<=\..*)\.+/g, '')
      .replace(/(?<=\.\d{2})\d+/, ''),
}
