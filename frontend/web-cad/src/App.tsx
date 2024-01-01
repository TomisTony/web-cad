import React, { useEffect } from "react"
import { ThreeApp } from "./ThreeApp"
import { Shape } from "./Shape"

import getOutput from "./output.temp"

function App() {
  const threeApp = ThreeApp.getInstance()
  useEffect(() => {
    getOutput().then((output) => {
      new Shape().setBrCADToScene(output)
    })
  }, [])
  return <></>
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
