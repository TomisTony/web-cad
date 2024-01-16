import React from "react"
import { useAppDispatch } from "./app/hooks"

import ThreeAppWrapper from "./Components/ThreeAppWrapper"

import { Button } from "antd"
import { loadModelAsync, loadDiffAsync } from "./features/model/modelSlice"

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
    <>
      <Button type="primary" onClick={loadModel}>
        加载模型
      </Button>
      <Button type="primary" onClick={loadDiff}>
        加载变更
      </Button>
      <div className="w-10 text-blue-500">111</div>
      <ThreeAppWrapper />
    </>
  )
}

export default App
