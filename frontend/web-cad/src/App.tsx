import React, { useEffect } from "react"
import { ThreeApp } from "./three/threeApp"
import { Shape } from "./shape/shape"

import { Button } from "antd"

import { getOutput, getDiff } from "./features/model/output.temp"

function App() {
  const threeApp = ThreeApp.getInstance()
  const loadModel = () => {
    getOutput().then((output) => {
      new Shape().setBrCADToScene(output)
    })
  }
  const loadDiff = () => {
    getOutput().then((output) => {
      getDiff().then((diff) => {
        console.log("origin", output)
        console.log("diff", diff)
        new Shape().applyDiffToBrCAD(output, diff)
        // console.log("fixed", output)
        new Shape().setBrCADToScene(output)
      })
    })
  }
  return (
    <>
      <Button type="primary" onClick={loadModel}>
        加载模型
      </Button>
      <Button type="primary" onClick={loadDiff}>
        加载变更
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
