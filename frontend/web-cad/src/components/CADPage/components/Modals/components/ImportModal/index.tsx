import React from "react"
import { InboxOutlined } from "@ant-design/icons"
import { Modal, Upload, message } from "antd"
import type { UploadProps } from "antd"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { setModal } from "@/store/globalStatus/globalStatusAction"
import { useParams } from "react-router-dom"

import apis from "@/apis"
import { importFile } from "@/store/model/modelActions"

const { Dragger } = Upload

function ImportModal() {
  const { projectId } = useParams()
  const nowModal = useAppSelector((state) => state.globalStatus.modal)
  const isModalOpen = nowModal === "import"
  const dispatch = useAppDispatch()
  const cancel = () => {
    dispatch(setModal(""))
  }
  const props: UploadProps = {
    name: "file",
    accept: ".step,.stp",
    action: apis.getUploadFileUrl(parseInt(projectId || "0")),
    onChange(info: any) {
      const { status } = info.file
      if (status !== "uploading") {
        console.log(info.file, info.fileList)
      }
      if (status === "done") {
        dispatch(setModal(""))
        dispatch(importFile(info.file.response.data))
        message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === "error") {
        dispatch(setModal(""))
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files)
    },
    maxCount: 1,
  }

  return (
    <Modal
      open={isModalOpen}
      closable
      title={"Import"}
      footer={null}
      onCancel={cancel}
    >
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single upload. Legel format: *.step, *.STP
        </p>
      </Dragger>
    </Modal>
  )
}

export default ImportModal
