import React from "react"

interface SidePanelProps {
  className?: string
}

function SidePanel(props: SidePanelProps) {
  return (
    <div
      className={
        "bg-black flex items-center justify-center text-white" +
        " " +
        props.className
      }
    >
      SidePanel
      <br />
      on DEV
    </div>
  )
}

export default SidePanel
