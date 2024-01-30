import React from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { setOperationPanel } from "@/store/globalStatus/globalStatusAction"
import { historyCheckingAbledOperationList } from "@/operations/operationList"

interface OperationButtonProps {
  className?: string
  action: () => () => void
  img?: string
  icon?: (className: any) => React.ReactNode
  label: string
}

function OperationButton(props: OperationButtonProps) {
  const dispatch = useAppDispatch()
  const operationPanel = useAppSelector(
    (state) => state.globalStatus.operationPanel,
  )
  const isHistoryChecking = useAppSelector(
    (state) => state.globalStatus.historyChecking,
  )
  const onClick = () => {
    // 现在由 CSS 直接指定无法响应鼠标事件
    // if (
    //   isHistoryChecking &&
    //   !historyCheckingAbledOperationList.includes(props.label)
    // ) {
    //   return
    // }
    if (operationPanel === props.label) {
      dispatch(setOperationPanel(""))
      return
    }
    dispatch(props.action())
  }
  return (
    <div
      className={
        "flex flex-col items-center justify-center  w-16 p-2 select-none" +
        " rounded-lg border border-black border-solid border-opacity-0 " +
        "hover:bg-gray-800 hover:text-white hover:cursor-pointer " +
        "active:bg-gray-700 active:text-white transition duration-300 " +
        (operationPanel === props.label ? "bg-gray-700 text-white" : " ") +
        " " +
        (isHistoryChecking &&
        !historyCheckingAbledOperationList.includes(props.label)
          ? "opacity-40 pointer-events-none "
          : " ") +
        (props.className ?? "")
      }
      onClick={onClick}
    >
      <div className="w-10 h-10">
        {props.img && (
          <img
            src={props.img}
            alt={props.label}
            className="w-full h-full pointer-events-none"
          />
        )}
        {props.icon && props.icon("text-4xl")}
      </div>

      <span className="mt-2 w-full text-center break-all">{props.label}</span>
    </div>
  )
}

export default OperationButton
