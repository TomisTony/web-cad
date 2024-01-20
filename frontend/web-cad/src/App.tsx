import React from "react"
import { useAppDispatch } from "./app/hooks"

import ThreeAppWrapper from "./components/ThreeAppWrapper"
import OperationList from "./components/OperationList"
import Modals from "./components/Modals"

function App() {
  return (
    <div className="w-[100vw] h-[100vh]">
      <OperationList className="absolute z-50 left-0 right-0" />
      <ThreeAppWrapper className="w-full h-full" />
      <Modals />
    </div>
  )
}

export default App
