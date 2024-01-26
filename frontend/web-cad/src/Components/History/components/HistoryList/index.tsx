import React, { useEffect, useState } from "react"
import { Popover } from "antd"
import apis from "@/apis"
import { History } from "@/types/History"
import operationList from "@/operations/operationList"
import { getTimeString } from "@/utils/time"

interface HistoryListProps {
  className?: string
}

function HistoryList(props: HistoryListProps) {
  const [historyList, setHistoryList] = useState<History[]>([])
  useEffect(() => {
    apis.getHistory().then((res) => {
      const data = res.map((value) => {
        return {
          ...value,
          operationSetting: operationList.find(
            (operation) => operation.label === value.operationName,
          )?.operationSetting,
        }
      })
      setHistoryList(data)
    })
  }, [])

  return (
    <div
      className={
        "px-1 py-2 h-full bg-slate-800 flex justify-start space-x-1 bg-opacity-50 pointer-events-auto " +
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
          <Popover content={content} title={operationName} arrow={false}>
            <div
              key={index}
              className={
                "flex flex-col items-center justify-center bg-gray-600 bg-opacity-50 rounded-md px-2 py-1 " +
                "border-2 border-white border-solid border-opacity-15 hover:border-opacity-70 "
              }
            >
              {setting?.img && (
                <img
                  src={setting.img}
                  alt="operation"
                  className="w-10 h-10 object-contain"
                />
              )}
              {setting?.icon && setting.icon("text-4xl")}
            </div>
          </Popover>
        )
      })}
    </div>
  )
}

export default HistoryList
