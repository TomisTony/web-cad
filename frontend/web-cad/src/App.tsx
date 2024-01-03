import React, { useEffect } from "react"
import { ThreeApp } from "./ThreeApp"
import { Shape } from "./Shape"

import { Button } from "antd"

import getOutput from "./output.temp"

function App() {
  const threeApp = ThreeApp.getInstance()
  const loadModel = () => {
    getOutput().then((output) => {
      new Shape().setBrCADToScene(output)
    })
  }
  return (
    <>
      <Button type="primary" onClick={loadModel}>
        加载模型
      </Button>
    </>
  )
}

// import output from "./output.temp"

// function App() {
//   useEffect(() => {
//     const scene = new ThreeScene()
//     scene.addBrCADToScene(output)
//   }, [])

//   return <></>
// }

export default App
