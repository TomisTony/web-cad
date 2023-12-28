import React, { useEffect } from "react"
import { ThreeScene } from "./ThreeScene"

import getOutput from "./output.temp"

function App() {
  useEffect(() => {
    const scene = new ThreeScene()
    getOutput().then((res) => {
      console.log(res)
      scene.addBrCADToScene(res)
      scene.setCamera()
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
