import React, { useState } from "react"
import { Checkbox, CheckboxProps, Modal, Tooltip } from "antd"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import operationList from "@/operations/operationList"
import { getTimeString } from "@/utils/time"
import { QuestionCircleFilled } from "@ant-design/icons"
import { rollbackAsync } from "@/store/model/modelActions"
import { deleteProjectHistoryAsync } from "@/store/history/historyAction"

function RollbackHistoryModal() {
  const dispatch = useAppDispatch()
  const [isConcatenationMode, setIsConcatenationMode] = useState(true)
  const nowModal = useAppSelector((state) => state.globalStatus.modal)
  const isModalOpen = nowModal === "rollbackHistory"
  const choosedHistoryIndex = useAppSelector(
    (state) => state.history.choosedHistoryIndex,
  )
  const onChange: CheckboxProps["onChange"] = (e) => {
    setIsConcatenationMode(e.target.checked)
  }

  let historyList = useAppSelector((state) => state.history.historyList)
  historyList = historyList.map((value) => {
    return {
      ...value,
      operationSetting: operationList.find(
        (operation) => operation.label === value.operationName,
      )?.operationSetting,
    }
  })
  const rollbackHistoryInfo = historyList[choosedHistoryIndex]

  const rollbackWithConcatenationMode = () => {
    dispatch(rollbackAsync({ rollbackId: rollbackHistoryInfo?.operationId }))
  }

  const rollbackWithNonConcatenationMode = () => {
    // 删除当前历史记录之后的所有历史记录
    dispatch(
      deleteProjectHistoryAsync(
        historyList[choosedHistoryIndex + 1]?.operationId,
      ),
    )
  }

  const onOk = () => {
    if (isConcatenationMode) {
      rollbackWithConcatenationMode()
    } else {
      rollbackWithNonConcatenationMode()
    }
    // 手动重置为默认值
    setIsConcatenationMode(true)
    dispatch({ type: "globalStatus/setModal", payload: "" })
  }

  return (
    <Modal
      open={isModalOpen}
      closable
      title={"Rollback History"}
      okType="danger"
      okText="Rollback"
      onOk={onOk}
      onCancel={() => {
        dispatch({ type: "globalStatus/setModal", payload: "" })
      }}
    >
      <div className="flex flex-col">
        <div
          className={
            "font-bold pb-2 " +
            "border-2 border-solid border-black border-t-0 border-l-0 border-r-0"
          }
        >
          Are you sure to <span className="text-red-700">rollback</span> to this
          history?
        </div>
        <div>
          <span className="font-bold">Operation: </span>
          {rollbackHistoryInfo?.operationName}
        </div>
        <div>
          <span className="font-bold">Operator: </span>
          {rollbackHistoryInfo?.operator}
        </div>
        <div>
          <span className="font-bold">Time: </span>
          {getTimeString(rollbackHistoryInfo?.time)}
        </div>
        <div>
          <span className="font-bold">Operation Settings:</span>
        </div>
        {rollbackHistoryInfo?.operationSubmitValues?.props && (
          <div className="ml-2">
            {Object.keys(rollbackHistoryInfo?.operationSubmitValues?.props).map(
              (key) => {
                return (
                  <div key={key} className="flex space-x-2">
                    <div>{key + ": "}</div>
                    <div>
                      {rollbackHistoryInfo?.operationSubmitValues?.props[key]}
                    </div>
                  </div>
                )
              },
            )}
          </div>
        )}
        <Checkbox
          className="mt-4"
          checked={isConcatenationMode}
          onChange={onChange}
        >
          <span className="font-bold">Concatenation Mode</span>
          <Tooltip
            title={
              "This mode creates a new history entry for every rollback operation." +
              " It preserves the entire history chain for better traceability, " +
              "automatically locating the latest history record after each rollback."
            }
            className="text-center"
          >
            <QuestionCircleFilled className="text-sm ml-2" />
          </Tooltip>
        </Checkbox>
      </div>
    </Modal>
  )
}

export default RollbackHistoryModal
