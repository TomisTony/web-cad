import React from "react"
import { Modal } from "antd"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { setModal } from "@/store/globalStatus/globalStatusAction"

function ExportModal() {
  const nowModal = useAppSelector((state) => state.globalStatus.modal)
  const isModalOpen = nowModal === "export"
  const dispatch = useAppDispatch()
  const cancel = () => {
    dispatch(setModal(""))
  }
  return (
    <Modal open={isModalOpen} closable footer={null} onCancel={cancel}>
      export
    </Modal>
  )
}

export default ExportModal
