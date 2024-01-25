/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react"

import { useAppSelector } from "@/app/hooks"

import ThreeAppWrapper from "@/components/ThreeAppWrapper"
import OperationList from "@/components/OperationList"
import OperationPanel, { OperationSetting } from "@/components/OperationPanel"
import operationList from "@/operations/operationList"
import History from "@/components/History"
import SidePanel from "@/components/SidePanel"

function MainContent() {
  const operationPanel = useAppSelector(
    (state) => state.globalStatus.operationPanel,
  )

  return (
    <div className="w-[100vw] h-[100vh] flex">
      <div className="flex-1 relative">
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
        <History className="absolute bottom-0 left-0 h-[15%] w-full z-50" />
        <ThreeAppWrapper className="w-full h-full" />
      </div>
      <SidePanel className="w-[20%] h-full" />
    </div>
  )
}

export default MainContent
