import React from "react"
import { OperationSetting } from "@/types/Operation"

import fillet from "@/assets/operations/fillet.png"

import { UploadOutlined, ExportOutlined } from "@ant-design/icons"

import store from "@/app/store"

import {
  setModal,
  setOperationPanel,
} from "@/store/globalStatus/globalStatusAction"
import { filletAsync } from "@/store/model/modelActions"

interface Operation {
  label: string
  img?: string
  icon?: (className: any) => React.ReactNode
  action: () => any
  operationSetting?: OperationSetting
  isDelimiter?: boolean
  ableInHistoryChecking?: boolean
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
    ableInHistoryChecking: true,
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
    action: () => store.dispatch(setOperationPanel("Fillet")),
    operationSetting: {
      operationName: "Fillet",
      chooseCount: 1,
      chooseLabelList: ["Edge"],
      chooseTypeList: ["edge"],
      props: [
        {
          type: "input",
          label: "radius",
          info: "radius",
          defaultValue: 0.1,
        },
      ],
      onSubmit: (values) => {
        store.dispatch(filletAsync(values))
      },
    },
  },
]

export default operationList
