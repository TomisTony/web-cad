import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { CaretLeftOutlined } from "@ant-design/icons"
import { Badge } from "antd"
import apis from "@/apis"
import { ProjectInfo } from "@/types/User"
import { useParams } from "react-router-dom"

function SidePanelOpenButton(props: { className?: string }) {
  const { projectId } = useParams()
  const dispatch = useAppDispatch()
  const messageCount = useAppSelector((state) => state.message.newCount)
  useEffect(() => {
    apis.getProjectInfo(projectId || "1").then((data) => {
      dispatch({
        type: "globalStatus/setProjectInfo",
        payload: data as ProjectInfo,
      })
    })
  }, [])

  return (
    <Badge
      count={messageCount}
      dot
      style={{ width: "9px", height: "9px" }}
      offset={[-45, 1]}
      className={
        "-translate-y-1/2 translate-x-1/2" + " " + props.className ?? ""
      }
    >
      <div
        className={
          "cursor-pointer h-24 w-10 bg-slate-500 " +
          "border-solid border-opacity-10 border-black rounded-lg " +
          "flex items-center justify-start "
        }
        onClick={() => {
          dispatch({
            type: "globalStatus/setSidePanelVisible",
            payload: true,
          })
        }}
      >
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2">
          <CaretLeftOutlined className="text-white text-2xl" />
        </div>
      </div>
    </Badge>
  )
}

export default SidePanelOpenButton
