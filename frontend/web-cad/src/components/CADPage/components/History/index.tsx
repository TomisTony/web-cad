import React from "react"
import HistoryList from "./components/HistoryList"
import FunctionalButtonList from "./components/FunctionalButtonList"
import { CaretUpOutlined } from "@ant-design/icons"
import { useAppSelector } from "@/app/hooks"

interface HistoryProps {
  className?: string
}

function History(props: HistoryProps) {
  const choosedHistoryIndex = useAppSelector(
    (state) => state.history.choosedHistoryIndex,
  )
  const historyList = useAppSelector((state) => state.history.historyList)
  const choosedHistoryName = historyList[choosedHistoryIndex]?.operationName
  return (
    <div
      className={
        "bg-gray-600 bg-opacity-50 p-1 flex justify-between space-x-2 " +
        props.className
      }
    >
      <div className="flex flex-col flex-1 w-[80%]">
        <div className="m-1 text-white font-bold flex justify-between">
          {"History"}
          <div className="text-base">
            <CaretUpOutlined />
            {": The History Currently Being Displayed"}
          </div>
        </div>
        <HistoryList className="m-1 flex-1 overflow-auto" />
      </div>
      <div className="w-[1px] bg-gray-300" />
      <div className="flex flex-col w-[20%]">
        <div className="m-1 text-white font-bold">
          Choosed History: {choosedHistoryName ?? "None"}
        </div>
        <FunctionalButtonList className="m-1 mr-4 flex-1" />
      </div>
    </div>
  )
}

export default History
