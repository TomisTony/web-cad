import React, { useState } from "react"
import { Modal, Button, Select, message } from "antd"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { setModal } from "@/store/globalStatus/globalStatusAction"
import apis from "@/apis"

function ExportModal() {
  const nowModal = useAppSelector((state) => state.globalStatus.modal)
  const nowHistoryIndex = useAppSelector(
    (state) => state.history.nowHistoryIndex,
  )
  const historyList = useAppSelector((state) => state.history.historyList)
  const lastOperationId = historyList[nowHistoryIndex]?.operationId
  const isModalOpen = nowModal === "export"
  const dispatch = useAppDispatch()
  const [format, setFormat] = useState(".step")
  const cancel = () => {
    dispatch(setModal(""))
  }
  const download = async () => {
    let auth = ""
    try {
      const userDataJson = localStorage.getItem("userData")
      if (userDataJson) {
        const token = JSON.parse(userDataJson)?.token
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        auth = `Bearer ${token}`
      }
    } catch (err) {
      console.log(err)
    }
    await fetch(apis.getDownloadUrl(lastOperationId, format), {
      method: "GET",
      headers: {
        Authorization: auth,
      },
    })
      .then((response) => {
        if (!response.ok) {
          message.error("Download failed")
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
    dispatch(setModal(""))
  }
  const options = [
    { value: ".step", label: "STEP" },
    { value: ".stl", label: "STL" },
    { value: ".iges", label: "IGES" },
  ]
  return (
    <Modal
      open={isModalOpen}
      title={"Export"}
      closable
      footer={null}
      onCancel={cancel}
    >
      <div className="flex flex-col">
        <span className="mt-4 text-lg">Choose the export format:</span>
        <Select
          className="mt-2"
          value={format}
          options={options}
          onChange={(value) => setFormat(value)}
        />
        <Button className="mt-10" type="primary" onClick={download}>
          Export
        </Button>
      </div>
    </Modal>
  )
}

export default ExportModal
