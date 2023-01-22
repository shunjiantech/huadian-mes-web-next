import { TreeSelectProps } from 'antd'

export const filterTreeNodeTitle: TreeSelectProps['filterTreeNode'] = (
  inputValue,
  treeNode,
) => {
  return (
    typeof treeNode.title === 'string' && treeNode.title.includes(inputValue)
  )
}
