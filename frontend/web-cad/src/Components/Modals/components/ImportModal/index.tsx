import React from "react"
import { Modal } from "antd"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { setModal } from "@/store/globalStatus/globalStatusAction"

function ImportModal() {
  const nowModal = useAppSelector((state) => state.globalStatus.modal)
  const isModalOpen = nowModal === "import"
  const dispatch = useAppDispatch()
  const cancel = () => {
    dispatch(setModal(""))
  }
  return (
    <Modal open={isModalOpen} closable footer={null} onCancel={cancel}>
      Import
    </Modal>
  )
}

export default ImportModal
