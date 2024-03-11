import React, { useRef, useEffect } from "react"
import { Tree } from "antd"

interface TopoSelectTreeProps {
  selectedKeys: string[]
  onSelect: (selectedKeys: string[]) => void
  treeData: any[]
}

function TopoSelectTree(props: TopoSelectTreeProps) {
  const { selectedKeys, onSelect, treeData } = props
  const ref = useRef<any>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({ key: selectedKeys[0] })
    }
  }, [selectedKeys[0]])

  return (
    <Tree
      ref={ref}
      selectedKeys={selectedKeys}
      onSelect={onSelect}
      defaultExpandAll
      treeData={treeData}
      className="bg-white bg-opacity-50 my-1"
      height={200}
    />
  )
}

export default TopoSelectTree
