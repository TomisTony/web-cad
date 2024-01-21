import React from "react"
import { Modal, Button } from "antd"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { setModal } from "@/store/globalStatus/globalStatusAction"
import apis from "@/apis"

function ExportModal() {
  const nowModal = useAppSelector((state) => state.globalStatus.modal)
  const isModalOpen = nowModal === "export"
  const dispatch = useAppDispatch()
  const cancel = () => {
    dispatch(setModal(""))
  }
  const download = () => {
    fetch(apis.getDownloadUrl("93", ".step"), {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status)
        }
        // 获取到数据，使用 blob 方法读取
        return response.blob().then((blob) => {
          return { blob, response }
        })
      })
      .then(({ blob, response }) => {
        // 创建本地链接
        const blobURL = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = blobURL
        const contentDisposition = response.headers.get("Content-Disposition")
        let filename = ""
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
          filename =
            fileNameMatch && fileNameMatch.length > 1
              ? fileNameMatch[1]
              : "downloaded_file"
        }
        console.log(filename)
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
      .catch((e) => {
        // 在这里处理错误
        console.log(e)
      })
  }
  return (
    <Modal open={isModalOpen} closable footer={null} onCancel={cancel}>
      <Button onClick={download}>Export</Button>
    </Modal>
  )
}

export default ExportModal
