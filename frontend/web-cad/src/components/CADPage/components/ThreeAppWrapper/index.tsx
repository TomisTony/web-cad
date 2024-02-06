import React, { useEffect, useRef } from "react"
import { ThreeApp } from "@/three/threeApp"
import { ThreeScene } from "@/three/threeScene"

import { useAppSelector } from "@/app/hooks"

interface ThreeAppWrapperProps {
  className?: string
}

function ThreeAppWrapper(props: ThreeAppWrapperProps) {
  const containerRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const threeSceneRef = useRef() as React.MutableRefObject<ThreeScene>

  const isOperationExecuting = useAppSelector(
    (state) => state.globalStatus.operationExecuting,
  )

  useEffect(() => {
    threeSceneRef.current = ThreeApp.getScene()
    threeSceneRef.current.setSizeFromDomElement(containerRef.current)
    containerRef.current.appendChild(threeSceneRef.current.renderer.domElement)
    containerRef.current.addEventListener(
      "resize",
      threeSceneRef.current.onParentDomResize,
    )

    return () => {
      containerRef.current?.removeChild(
        threeSceneRef.current.renderer.domElement,
      )
      threeSceneRef.current.clearScene()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={"relative" + " " + props.className ?? ""}
    >
      {isOperationExecuting && (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="text-white text-2xl">Operation Executing...</div>
        </div>
      )}
    </div>
  )
}

export default ThreeAppWrapper
