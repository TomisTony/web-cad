import React from "react"

import fillet from "@/assets/operations/fillet.png"

import { UploadOutlined, ExportOutlined } from "@ant-design/icons"

import store from "@/app/store"

import { setModal } from "@/store/globalStatus/globalStatusAction"
import { filletAsync } from "@/store/model/modelActions"

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
    label: "Fillet",
    img: fillet,
    action: filletAsync,
  },
]

export default operationList
