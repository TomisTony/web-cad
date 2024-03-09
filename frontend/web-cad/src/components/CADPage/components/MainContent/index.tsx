/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react"
import { Drawer } from "antd"

import { useAppSelector, useAppDispatch } from "@/app/hooks"

import { OperationSetting } from "@/types/Operation"

import ThreeAppWrapper from "@/components/CADPage/components/ThreeAppWrapper"
import OperationList from "@/components/CADPage/components/OperationList"
import OperationPanel from "@/components/CADPage/components/OperationPanel"
import operationList from "@/operations/operationList"
import History from "@/components/CADPage/components/History"
import SidePanel from "@/components/CADPage/components/SidePanel"
import SidePanelOpenButton from "../SidePanelOpenButton"

function MainContent() {
  const dispatch = useAppDispatch()
  const operationPanel = useAppSelector(
    (state) => state.globalStatus.operationPanel,
  )
  const sidePanelVisible = useAppSelector(
    (state) => state.globalStatus.sidePanelVisible,
  )

  return (
    <div className="w-[100vw] h-[100vh] flex relative overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute z-50 left-0 right-0 pointer-events-none">
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
      {!sidePanelVisible && (
        <SidePanelOpenButton className="absolute top-1/2 right-0" />
      )}
      <Drawer
        open={sidePanelVisible}
        title="Infomation"
        onClose={() => {
          dispatch({ type: "globalStatus/setSidePanelVisible", payload: false })
        }}
      >
        <SidePanel />
      </Drawer>
    </div>
  )
}

export default MainContent
