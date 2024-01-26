import React from "react"

interface HistoryListProps {
  className?: string
}

function HistoryList(props: HistoryListProps) {
  return (
    <div
      className={
        "px-4 py-2 bg-slate-800 flex justify-start space-x-1 bg-opacity-50 pointer-events-auto " +
        (props.className ?? "")
      }
    ></div>
  )
}

export default HistoryList
