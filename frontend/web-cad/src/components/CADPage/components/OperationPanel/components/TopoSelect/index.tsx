import React, { useMemo, useState } from "react"
import { Tree, TreeDataNode } from "antd"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import TopoSelectTree from "./components/TopoSelectTree"
import { setChoosedInfosAndHighlightManually } from "@/store/model/modelActions"
import { ThreeApp } from "@/three/ThreeApp"

interface TopoSelectProps {
  typeList: string[]
  chooseLabelList: string[]
  choosedList: (string | undefined)[]
  setChoosedList: React.Dispatch<React.SetStateAction<(string | undefined)[]>>
}

function TopoSelect(props: TopoSelectProps) {
  const { typeList, chooseLabelList, choosedList, setChoosedList } = props
  const dispatch = useAppDispatch()
  const projectInfo = useAppSelector((state) => state.globalStatus.projectInfo)
  const brcad = useAppSelector((state) => state.model.model)
  const brcadStructure = brcad?.structure

  const getTreeData = (type: string) => {
    switch (type) {
      case "edge":
        return edgeTreeData
      case "face":
        return faceTreeData
      case "solid":
        return solidTreeData
      default:
        return []
    }
  }

  const edgeTreeData: TreeDataNode[] = useMemo(() => {
    return [
      {
        title: projectInfo?.name ?? "Root",
        key: "root",
        children: brcadStructure?.children.map((node) => {
          return {
            title: node.label,
            key: node.id,
            children: node.edges.map((edge, index) => {
              return {
                title: "edge " + index,
                key: edge,
              }
            }),
          }
        }),
      },
    ]
  }, [brcadStructure, projectInfo])

  const faceTreeData: TreeDataNode[] = useMemo(() => {
    return [
      {
        title: projectInfo?.name ?? "Root",
        key: "root",
        children: brcadStructure?.children.map((node) => {
          return {
            title: node.label,
            key: node.id,
            children: node.faces.map((face, index) => {
              return {
                title: "face " + index,
                key: face,
              }
            }),
          }
        }),
      },
    ]
  }, [brcadStructure, projectInfo])

  const solidTreeData: TreeDataNode[] = useMemo(() => {
    return [
      {
        title: projectInfo?.name ?? "Root",
        key: "root",
        children: brcadStructure?.children.map((node) => {
          return {
            title: node.label,
            key: node.id,
          }
        }),
      },
    ]
  }, [brcadStructure, projectInfo])

  const onSelectByIndex = (index: number) => {
    return (selectedKeys: string[]) => {
      const originChoosedList = [...choosedList]
      originChoosedList[index] = selectedKeys[0]
      setChoosedList(originChoosedList)
      const res = converteToChoosedInfo(typeList, originChoosedList)
      dispatch(
        setChoosedInfosAndHighlightManually(
          res.idList,
          res.typeList,
          ThreeApp.getScene(),
        ),
      )
    }
  }

  const converteToChoosedInfo = (
    _typeList: string[],
    choosedList: (string | undefined)[],
  ) => {
    const idList: string[] = []
    const typeList: string[] = []
    _typeList.forEach((type, index) => {
      if (choosedList[index]) {
        idList.push(choosedList[index] as string)
        typeList.push(type)
      }
    })
    return { idList, typeList }
  }

  return (
    <div>
      {typeList.map((type, index) => {
        return (
          <div key={index}>
            {chooseLabelList[index] + ":"}
            <TopoSelectTree
              selectedKeys={
                choosedList[index] ? [choosedList[index] as string] : []
              }
              onSelect={onSelectByIndex(index)}
              treeData={getTreeData(type)}
            />
          </div>
        )
      })}
    </div>
  )
}

export default TopoSelect
