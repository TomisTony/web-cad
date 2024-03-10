import React, { useRef, useEffect, useMemo, useState } from "react"
import { Tree, TreeDataNode } from "antd"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { BrCADNode } from "@/types/BrCAD"
import { setChoosedSolidIdList } from "@/store/model/modelActions"

interface NodeTreeProps {
  className?: string
}

function NodeTree(props: NodeTreeProps) {
  const dispatch = useAppDispatch()
  const choosedSolidIdList = useAppSelector(
    (state) => state.model.choosedSolidIdList,
  )
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const treeRef = useRef<any>(null)
  const brcad = useAppSelector((state) => state.model.model)
  const projectInfo = useAppSelector((state) => state.globalStatus.projectInfo)
  const brcadStructure = brcad?.structure
  const [treeHight, setTreeHight] = React.useState(0)
  useEffect(() => {
    if (ref.current) {
      // 获取所有样式
      const style = window.getComputedStyle(ref.current)

      // 获取元素实际的高度（包括padding）
      const totalHeight = ref.current.clientHeight

      // 提取padding值
      const paddingTop = parseFloat(style.getPropertyValue("padding-top"))
      const paddingBottom = parseFloat(style.getPropertyValue("padding-bottom"))

      // 计算并打印不包括padding的高度
      const heightWithoutPadding = totalHeight - paddingTop - paddingBottom
      setTreeHight(heightWithoutPadding)
    }
  }, [ref])

  useEffect(() => {
    setSelectedKeys(choosedSolidIdList)
    treeRef.current.scrollTo({ key: choosedSolidIdList[0] })
  }, [choosedSolidIdList])

  const makeDisabledTreeDataNode = (node: BrCADNode): TreeDataNode => {
    return {
      title: node.label,
      key: node.id,
      disabled: true,
      children: node.children.map(makeDisabledTreeDataNode),
    }
  }

  const treeData: TreeDataNode[] = useMemo(() => {
    console.log(projectInfo?.name)
    return [
      {
        title: projectInfo?.name ?? "Root",
        key: "root",
        children: brcadStructure?.children.map((node) => {
          return {
            title: node.label,
            key: node.id,
            children: node.children.map(makeDisabledTreeDataNode),
          }
        }),
      },
    ]
  }, [brcadStructure, projectInfo])

  return (
    <div
      ref={ref}
      className={
        "bg-gray-400 bg-opacity-70 w-[18%] p-4 flex flex-col shadow-sm" +
        " select-none pointer-events-auto " +
        "rounded-lg" +
        "border-solid border border-black" +
        props.className
      }
    >
      <Tree
        ref={treeRef}
        selectedKeys={selectedKeys}
        treeData={treeData}
        defaultExpandedKeys={["root"]}
        height={treeHight} // 获取 ref 元素的高度
        className="bg-white bg-opacity-30"
      />
    </div>
  )
}

export default NodeTree
