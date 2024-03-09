import React from "react"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { Descriptions, DescriptionsProps } from "antd"
import { getUserData } from "@/utils/localStorage"

interface SidePanelProps {
  className?: string
}

function SidePanel(props: SidePanelProps) {
  const projectInfo = useAppSelector((state) => state.globalStatus.projectInfo)
  const userData = getUserData()

  const projectInfoItems: DescriptionsProps["items"] = [
    {
      key: "projectName",
      label: "Name",
      span: 1,
      children: projectInfo?.name,
    },
    {
      key: "projectDescription",
      label: "Description",
      span: 1,
      children: projectInfo?.description,
    },
    {
      key: "projectOwner",
      label: "Owner",
      span: 1,
      children: projectInfo?.owner,
    },
    {
      key: "projectCreateTime",
      label: "Create Time",
      span: 1,
      children: projectInfo?.createTime,
    },
    {
      key: "projectEditors",
      label: "Editors",
      span: 1,
      children: projectInfo?.editors?.join(" ") || "None",
    },
  ]

  const userInfoItems: DescriptionsProps["items"] = [
    {
      key: "userName",
      label: "Name",
      span: 1,
      children: userData?.name,
    },
    {
      key: "userId",
      label: "Id",
      span: 1,
      children: userData?.id,
    },
  ]

  return (
    <div className={"" + " " + props.className}>
      <Descriptions
        column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
        title="User Info"
        items={userInfoItems}
      />
      <Descriptions
        style={{ marginTop: "20px" }}
        column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
        title="Project Info"
        items={projectInfoItems}
      />
    </div>
  )
}

export default SidePanel
