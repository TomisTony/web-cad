import React from "react"

import ThreeAppWrapper from "./components/ThreeAppWrapper"
import OperationList from "./components/OperationList"
import OperationPanel, { OperationSetting } from "./components/OperationPanel"
import Modals from "./components/Modals"

import { useAppSelector } from "./app/hooks"

import operationList from "./operations/operationList"

function App() {
  const operationPanel = useAppSelector(
    (state) => state.globalStatus.operationPanel,
  )

  return (
    <div className="w-[100vw] h-[100vh]">
      <div className="absolute z-50 left-0 right-0">
        <OperationList />
        {operationPanel && (
          <OperationPanel
            operationSetting={
              operationList.find((value) => value.label == operationPanel)
                ?.operationSetting || ({} as OperationSetting)
            }
          />
        )}
      </div>

      <ThreeAppWrapper className="w-full h-full" />
      <Modals />
    </div>
  )
}

export default App
