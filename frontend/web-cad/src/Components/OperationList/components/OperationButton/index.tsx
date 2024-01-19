import React from "react"

interface OperationButtonProps {
  className?: string
  onClick?: () => void
  img?: string
  label: string
}

function OperationButton(props: OperationButtonProps) {
  return (
    <div
      className={
        "flex flex-col items-center rounded-sm border border-black" +
        props.className ?? ""
      }
      onClick={props.onClick}
    >
      <img src={props.img} alt={props.label} />
      <span>{props.label}</span>
    </div>
  )
}

export default OperationButton
