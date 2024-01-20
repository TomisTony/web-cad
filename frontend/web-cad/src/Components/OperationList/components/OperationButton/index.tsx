import React from "react"
import { useAppDispatch } from "@/app/hooks"

interface OperationButtonProps {
  className?: string
  action: () => () => void
  img?: string
  icon?: (className: any) => React.ReactNode
  label: string
}

function OperationButton(props: OperationButtonProps) {
  const dispatch = useAppDispatch()
  const onClick = () => {
    dispatch(props.action())
  }
  return (
    <div
      className={
        "flex flex-col items-center justify-center  w-16 p-2 select-none" +
        " rounded-lg border border-black border-solid border-opacity-0 " +
        "hover:bg-gray-800 hover:text-white hover:cursor-pointer active:bg-gray-700 transition duration-300" +
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
