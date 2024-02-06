import React from "react"
import { Button } from "antd"

interface FunctionalButtonProps {
  className?: string
  onClick?: () => void
  label: string
  disabled?: boolean
}

function FunctionalButton(props: FunctionalButtonProps) {
  return (
    <Button
      className={"w-[47%] font-bold " + (props.className ?? "")}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.label}
    </Button>
  )
}

export default FunctionalButton
