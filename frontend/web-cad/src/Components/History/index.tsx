import React from "react"
import HistoryList from "./components/HistoryList"
import FunctionalButtonList from "./components/FunctionalButtonList"

interface HistoryProps {
  className?: string
}

function History(props: HistoryProps) {
  return (
    <div
      className={
        "bg-gray-600 bg-opacity-50 p-1 flex justify-between space-x-2 " + props.className
      }
    >
      <div className="flex flex-col flex-1">
        <div className="m-1 text-white font-bold">History</div>
        <HistoryList className="m-1 flex-1" />
      </div>
      <div className="w-[1px] bg-gray-300" />
      <div className="flex flex-col w-[20%]">
        <div className="m-1 text-white font-bold">History Operation</div>
        <FunctionalButtonList className="m-1 mr-4 flex-1" />
      </div>
    </div>
  )
}

export default History
