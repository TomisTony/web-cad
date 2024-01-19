import React from "react"
import { useAppDispatch } from "./app/hooks"

import ThreeAppWrapper from "./components/ThreeAppWrapper"
import operationList from "./operations/operationList"

import { Button } from "antd"
import { loadModelAsync, loadDiffAsync } from "./features/model/modelSlice"
import OperationList from "./components/OperationList"

function App() {
  // 确保创建了ThreeApp实例

  const dispatch = useAppDispatch()
  const loadModel = () => {
    dispatch(loadModelAsync())
  }
  const loadDiff = () => {
    dispatch(loadDiffAsync())
  }
  return (
    <div className="flex flex-col w-[100vw] h-[100vh]">
      {/* <Button type="primary" onClick={loadModel}>
        加载模型
      </Button>
      <Button type="primary" onClick={loadDiff}>
        加载变更
      </Button> */}
      <OperationList />
      <ThreeAppWrapper className="flex-1" />
    </div>
  )
}

export default App
