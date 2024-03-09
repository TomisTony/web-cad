import React from "react"

interface NodeTreeProps {
  className?: string
}

function NodeTree(props: NodeTreeProps) {
  return (
    <div
      className={
        "bg-gray-400 bg-opacity-70 w-[18%] p-4 flex flex-col shadow-sm" +
        " select-none pointer-events-auto " +
        "rounded-lg" +
        "border-solid border border-black" +
        props.className
      }
    >
      NodeTree
    </div>
  )
}

export default NodeTree
