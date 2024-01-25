import React from "react"

interface HistoryProps {
  className?: string
}

function History(props: HistoryProps) {
  return (
    <div className={"bg-gray-600 bg-opacity-50 " + props.className}>111</div>
  )
}

export default History
