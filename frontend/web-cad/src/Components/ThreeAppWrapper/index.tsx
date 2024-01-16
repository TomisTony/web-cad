import React, { useEffect, useRef } from "react"
import { ThreeApp } from "@/three/threeApp"
import { ThreeScene } from "@/three/threeScene"

function ThreeAppWrapper() {
  const containerRef = useRef() as React.MutableRefObject<HTMLDivElement>
  const threeSceneRef = useRef() as React.MutableRefObject<ThreeScene>

  useEffect(() => {
    threeSceneRef.current = ThreeApp.getScene()
    threeSceneRef.current.setSizeFromDomElement(containerRef.current)
    containerRef.current.appendChild(threeSceneRef.current.renderer.domElement)

    return () => {
      containerRef.current?.removeChild(
        threeSceneRef.current.renderer.domElement,
      )
      threeSceneRef.current.clearScene()
    }
  }, [])

  return <div ref={containerRef} className="w-[1600px] h-[800px]" />
}

export default ThreeAppWrapper
