import React from "react"
import HistoryList from "./components/HistoryList"

interface HistoryProps {
  className?: string
}

function History(props: HistoryProps) {
  return (
    <div className={"bg-gray-600 bg-opacity-50 p-1 flex " + props.className}>
      <div className="flex flex-col h-full flex-1">
        <div className="m-1 text-white font-bold">Operation History</div>
        <HistoryList className="m-1 flex-1" />
      </div>
      <div className="w-[30%] bg-black text-white">功能按钮保留区域</div>
    </div>
  )
}

export default History
