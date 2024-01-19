import React, { useEffect, useRef } from "react"
import operationList from "@/operations/operationList"
import OperationButton from "./components/OperationButton"

interface OperationListProps {
  className?: string
}

function OperationList(props: OperationListProps) {
  return (
    <div
      className={
        "px-4 py-2 bg-slate-300 flex justify-start space-x-4 " +
          props.className ?? ""
      }
    >
      {operationList.map((operation) => {
        return <OperationButton key={operation.label} {...operation} />
      })}
    </div>
  )
}

export default OperationList
