import React from "react"
import operationList from "@/operations/operationList"
import OperationButton from "./components/OperationButton"

interface OperationListProps {
  className?: string
}

function OperationList(props: OperationListProps) {
  return (
    <div
      className={
        "px-4 py-2 bg-slate-300 flex flex-wrap justify-start space-x-1 bg-opacity-70 pointer-events-auto " +
        (props.className ?? "")
      }
    >
      {operationList.map((operation) => {
        if (operation.unvisibleInOperationList) return null
        if (operation.isDelimiter)
          return <div key={operation.label} className="w-[2px] h-25 bg-black" />
        return <OperationButton key={operation.label} {...operation} />
      })}
    </div>
  )
}

export default OperationList
