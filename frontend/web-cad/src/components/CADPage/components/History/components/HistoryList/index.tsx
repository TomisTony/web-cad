import React, { useEffect, useMemo } from "react"
import { History } from "@/types/History"
import { Popover } from "antd"
import operationList from "@/operations/operationList"
import { getTimeString } from "@/utils/time"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { CaretUpOutlined } from "@ant-design/icons"
import { Socket } from "@/utils/socket"
import { useParams } from "react-router-dom"

import { refreshHistoryList } from "@/store/history/historyAction"
import { setSceneToOperationModalAsync } from "@/store/model/modelActions"
import apis from "@/apis"

interface HistoryListProps {
  className?: string
}

function HistoryList(props: HistoryListProps) {
  const dispatch = useAppDispatch()
  const { projectId } = useParams()
  const choosedHistoryIndex = useAppSelector(
    (state) => state.history.choosedHistoryIndex,
  )
  const nowHistoryIndex = useAppSelector(
    (state) => state.history.nowHistoryIndex,
  )
  const rollbackHighlightIndex = useAppSelector(
    (state) => state.history.rollbackHighlightIndex,
  )
  useEffect(() => {
    // 直接获取最新的 HistoryList
    apis.getHistoryList(parseInt(projectId || "0")).then((res) => {
      dispatch(refreshHistoryList(res))
      // 加载最新的 History
      dispatch({
        type: "history/chooseHistory",
        payload: res.length - 1,
      })
      if (res.length > 0) {
        dispatch(setSceneToOperationModalAsync(res[res.length - 1].operationId))
      }
    })
    // websocket 订阅 HistoryList 更新
    const socket = new Socket(
      "ws://localhost:8000/websocket?projectId=1",
      (message: any) => {
        const data = JSON.parse(message.data)
        if (data.type === "updateHistoryList") {
          const historyList = JSON.parse(data.data)
          dispatch(refreshHistoryList(historyList))
        }
      },
      () => {
        console.log("HistoryList WebSocket Client Connected")
      },
    )

    return () => {
      socket.manualClose()
    }
  }, [])

  const historyListFromRedux = useAppSelector(
    (state) => state.history.historyList,
  )
  const historyList: History[] = useMemo(() => {
    return historyListFromRedux.map((value) => {
      return {
        ...value,
        operationSetting: operationList.find(
          (operation) => operation.label === value.operationName,
        )?.operationSetting,
      }
    })
  }, [historyListFromRedux])

  return (
    <div
      className={
        "px-1 pt-1 h-full bg-slate-800 flex justify-start space-x-2 bg-opacity-50 pointer-events-auto " +
        "rounded-md " +
        (props.className ?? "")
      }
    >
      {historyList.map((value, index) => {
        const operationName = value.operationName
        const setting = operationList.find(
          (operation) => operation.label === operationName,
        )
        const defaultContent = (
          <div className="flex justify-between text-bold text-sm">
            <span>{value.operator}</span>
            <span>{getTimeString(value.time)}</span>
          </div>
        )
        let content = defaultContent
        if (value?.operationSubmitValues?.props) {
          content = (
            <div>
              {defaultContent}
              <div className="flex flex-col mt-2 pt-1 border-black border-solid border-t-2 border-b-0 border-l-0 border-r-0">
                {setting?.hoverContent ||
                  Object.keys(value.operationSubmitValues.props).map((key) => {
                    return (
                      <div key={key} className="flex justify-between">
                        <div className="font-bold">{key}</div>
                        <div>{value?.operationSubmitValues?.props[key]}</div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )
        }

        return (
          <Popover
            key={index}
            content={content}
            title={operationName}
            arrow={false}
          >
            <div className="flex flex-col">
              <div
                className={
                  "flex-1 flex flex-col items-center justify-center bg-gray-600 bg-opacity-50 rounded-md px-1 " +
                  "border-2 border-white border-solid border-opacity-15 hover:border-opacity-70 " +
                  (choosedHistoryIndex === index
                    ? "shadow-outline-yellow "
                    : " ") +
                  (rollbackHighlightIndex === value.operationId
                    ? "shadow-outline-blue "
                    : " ")
                }
                onClick={() => {
                  dispatch({
                    type: "history/chooseHistory",
                    payload: index,
                  })
                }}
              >
                {setting?.img && (
                  <img
                    src={setting.img}
                    alt="operation"
                    className="w-10 h-10 object-contain"
                  />
                )}
                {setting?.icon && setting.icon("text-[40px] leading-[40px]")}
              </div>
              {
                <div className="flex justify-center items-start h-5 ">
                  {nowHistoryIndex === index && (
                    <CaretUpOutlined className="text-white text-xl leading-5" />
                  )}
                </div>
              }
            </div>
          </Popover>
        )
      })}
    </div>
  )
}

export default HistoryList
