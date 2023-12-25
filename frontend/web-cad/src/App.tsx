import React from "react"
import { ThreeScene } from "./ThreeScene"

import output from "./output"

function App() {
  const scene = new ThreeScene()
  scene.addBrCADToScene(output)
  return <div>111</div>
}

export default App
