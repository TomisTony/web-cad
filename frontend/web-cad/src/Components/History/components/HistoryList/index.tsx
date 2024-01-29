import React, { useEffect, useMemo } from "react"
import { History } from "@/types/History"
import { Popover } from "antd"
import operationList from "@/operations/operationList"
import { getTimeString } from "@/utils/time"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { CaretUpOutlined } from "@ant-design/icons"

import { refreshHistoryList } from "@/store/history/historyAction"
import apis from "@/apis"

interface HistoryListProps {
  className?: string
}

function HistoryList(props: HistoryListProps) {
  const dispatch = useAppDispatch()
  const choosedHistoryIndex = useAppSelector(
    (state) => state.history.choosedHistoryIndex,
  )
  const nowHistoryIndex = useAppSelector(
    (state) => state.history.nowHistoryIndex,
  )
  useEffect(() => {
    // 直接获取最新的 HistoryList
    apis.getHistoryList(1).then((res) => {
      dispatch(refreshHistoryList(res))
    })
    // websocket 订阅 HistoryList 更新
    const socket = new WebSocket("ws://localhost:8000/websocket?projectId=1")
    socket.onopen = () => {
      console.log("HistoryList WebSocket Client Connected")
    }
    socket.onmessage = (message) => {
      const data = JSON.parse(message.data)
      console.log(data)
      if (data.type === "updateHistoryList") {
        const historyList = JSON.parse(data.data)
        dispatch(refreshHistoryList(historyList))
      }
    }
    return () => {
      socket.close()
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
                {Object.keys(value.operationSubmitValues.props).map((key) => {
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
                  (choosedHistoryIndex === index ? "shadow-outline-yellow" : "")
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
