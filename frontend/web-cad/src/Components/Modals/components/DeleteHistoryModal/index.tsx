import React from "react"
import { Modal } from "antd"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import operationList from "@/operations/operationList"
import { getTimeString } from "@/utils/time"

function DeleteHistoryModal() {
  const dispatch = useAppDispatch()
  const nowModal = useAppSelector((state) => state.globalStatus.modal)
  const isModalOpen = nowModal === "deleteHistory"
  const choosedHistoryIndex = useAppSelector(
    (state) => state.history.choosedHistoryIndex,
  )

  let historyList = useAppSelector((state) => state.history.historyList)
  historyList = historyList.map((value) => {
    return {
      ...value,
      operationSetting: operationList.find(
        (operation) => operation.label === value.operationName,
      )?.operationSetting,
    }
  })
  const deleteHistoryInfo = historyList[choosedHistoryIndex]

  return (
    <Modal
      open={isModalOpen}
      closable
      title={"Delete History"}
      okType="danger"
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
          Are you sure to delete this history?
        </div>
        <div>
          <span className="font-bold">Operator: </span>
          {deleteHistoryInfo.operator}
        </div>
        <div>
          <span className="font-bold">Time: </span>
          {getTimeString(deleteHistoryInfo.time)}
        </div>
        <div>
          <span className="font-bold">Operation: </span>
          {deleteHistoryInfo.operationName}
        </div>
        <div>
          <span className="font-bold">Operation Settings:</span>
        </div>
        {deleteHistoryInfo?.operationSubmitValues?.props && (
          <div className="ml-2">
            {Object.keys(deleteHistoryInfo?.operationSubmitValues?.props).map(
              (key) => {
                return (
                  <div key={key} className="flex space-x-2">
                    <div>{key + ": "}</div>
                    <div>
                      {deleteHistoryInfo?.operationSubmitValues?.props[key]}
                    </div>
                  </div>
                )
              },
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default DeleteHistoryModal
