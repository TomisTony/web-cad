import React from "react"

import loadDiff from "@/assets/operations/loadDiff.png"
import loadModel from "@/assets/operations/loadModel.png"

import { UploadOutlined, ExportOutlined } from "@ant-design/icons"

import store from "@/app/store"

import { setModal } from "@/store/globalStatus/globalStatusAction"
import { loadModelAsync, loadDiffAsync } from "@/store/model/modelActions"

interface Operation {
  label: string
  img?: string
  icon?: (className: any) => React.ReactNode
  action: () => any
  isDelimiter?: boolean
}

const operationList: Operation[] = [
  {
    label: "Import",
    icon: (className) => <UploadOutlined className={className} />,
    action: () => store.dispatch(setModal("import")),
  },
  {
    label: "Export",
    icon: (className) => <ExportOutlined className={className} />,
    action: () => store.dispatch(setModal("export")),
  },
  {
    label: "delimiter",
    img: "",
    action: () => {
      console.log("delimiter")
    },
    isDelimiter: true,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
]

export default operationList
