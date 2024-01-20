import React from "react"
import { useAppDispatch } from "./app/hooks"

import ThreeAppWrapper from "./components/ThreeAppWrapper"
import operationList from "./operations/operationList"

import { Button } from "antd"
import OperationList from "./components/OperationList"

function App() {
  return (
    <div className="flex flex-col w-[100vw] h-[100vh]">
      <OperationList className="absolute left-0 right-0" />
      <ThreeAppWrapper className="w-full h-full" />
    </div>
  )
}

export default App
