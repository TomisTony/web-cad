import React from "react"
import { OperationSetting } from "@/types/Operation"

import fillet from "@/assets/operations/Part_Fillet.png"
import chamfer from "@/assets/operations/Part_Chamfer.png"
import transform from "@/assets/operations/transform.png"
import box from "@/assets/operations/Part_Box.png"
import cylinder from "@/assets/operations/Part_Cylinder.png"
import Cone from "@/assets/operations/Part_Cone.png"
import Torus from "@/assets/operations/Part_Torus.png"
import Sphere from "@/assets/operations/Part_Sphere.png"
import Boolean from "@/assets/operations/Part_Booleans.png"
import Cut from "@/assets/operations/Part_Cut.png"
import Fuse from "@/assets/operations/Part_Fuse.png"
import Common from "@/assets/operations/Part_Common.png"

import {
  UploadOutlined,
  ExportOutlined,
  RollbackOutlined,
  FormOutlined,
  DeleteOutlined,
} from "@ant-design/icons"

import store from "@/app/store"

import {
  setModal,
  setOperationPanel,
} from "@/store/globalStatus/globalStatusAction"
import {
  filletAsync,
  chamferAsync,
  renameAsync,
  transformAsync,
  deleteAsync,
  makeBoxAsync,
  makeCylinderAsync,
  makeConeAsync,
  makeSphereAsync,
  makeTorusAsync,
  booleanAsync,
  unionAsync,
  differenceAsync,
  intersectionAsync,
} from "@/store/model/modelActions"

interface Operation {
  label: string
  img?: string
  icon?: (className: any) => React.ReactNode
  action: () => any
  operationSetting?: OperationSetting
  isDelimiter?: boolean
  abled?: (historyChecking: boolean) => boolean
  unvisibleInOperationList?: boolean // 在 OperationList 中不可见，但是本身仍然属于 Operation
  hoverContent?: JSX.Element // 自定义悬浮展示内容
}

const operationList: Operation[] = [
  {
    label: "Import",
    icon: (className) => <UploadOutlined className={className} />,
    action: () => store.dispatch(setModal("import")),
    abled: (historyChecking: boolean) => historyChecking === false,
  },
  {
    label: "Export",
    icon: (className) => <ExportOutlined className={className} />,
    action: () => store.dispatch(setModal("export")),
    abled: () => true,
  },
  {
    label: "delimiter0",
    img: "",
    action: () => {
      console.log("delimiter")
    },
    isDelimiter: true,
  },
  {
    label: "Transform",
    img: transform,
    action: () => store.dispatch(setOperationPanel("Transform")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Transform",
      chooseCount: 1,
      chooseLabelList: ["Solid"],
      chooseTypeList: ["solid"],
      props: [
        {
          type: "input",
          label: "moveX",
          info: "moveX",
          defaultValue: "0.0",
        },
        {
          type: "input",
          label: "moveY",
          info: "moveY",
          defaultValue: "0.0",
        },
        {
          type: "input",
          label: "moveZ",
          info: "moveZ",
          defaultValue: "0.0",
        },
        {
          type: "input",
          label: "rotateX",
          info: "rotateX",
          defaultValue: "0.0",
        },
        {
          type: "input",
          label: "rotateY",
          info: "rotateY",
          defaultValue: "0.0",
        },
        {
          type: "input",
          label: "rotateZ",
          info: "rotateZ",
          defaultValue: "0.0",
        },
        {
          type: "input",
          label: "scale",
          info: "scale",
          defaultValue: "1.0",
        },
      ],
      onSubmit: (values) => {
        store.dispatch(transformAsync(values))
      },
    },
  },
  {
    label: "Rename",
    icon: (className) => <FormOutlined className={className} />,
    action: () => store.dispatch(setOperationPanel("Rename")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Rename",
      chooseCount: 1,
      chooseLabelList: ["Solid"],
      chooseTypeList: ["solid"],
      props: [
        {
          type: "input",
          label: "name",
          info: "New Name",
          defaultValue: "New Name",
        },
      ],
      onSubmit: (values) => {
        store.dispatch(renameAsync(values))
      },
    },
  },
  {
    label: "Delete",
    icon: (className) => <DeleteOutlined className={className} />,
    action: () => store.dispatch(setOperationPanel("Delete")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Delete",
      chooseCount: 1,
      chooseLabelList: ["Solid"],
      chooseTypeList: ["solid"],
      props: [],
      onSubmit: (values) => {
        store.dispatch(deleteAsync(values))
      },
    },
  },
  {
    label: "delimiter1",
    img: "",
    action: () => {
      console.log("delimiter")
    },
    isDelimiter: true,
  },
  {
    label: "Box",
    img: box,
    action: () => store.dispatch(setOperationPanel("Box")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Box",
      chooseCount: 0,
      chooseLabelList: [],
      chooseTypeList: [],
      props: [
        {
          type: "input",
          label: "x",
          info: "x",
          defaultValue: "1.0",
        },
        {
          type: "input",
          label: "y",
          info: "y",
          defaultValue: "1.0",
        },
        {
          type: "input",
          label: "z",
          info: "z",
          defaultValue: "1.0",
        },
      ],
      onSubmit: (values) => {
        store.dispatch(makeBoxAsync(values))
      },
    },
  },
  {
    label: "Cylinder",
    img: cylinder,
    action: () => store.dispatch(setOperationPanel("Cylinder")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Cylinder",
      chooseCount: 0,
      chooseLabelList: [],
      chooseTypeList: [],
      props: [
        {
          type: "input",
          label: "radius",
          info: "radius",
          defaultValue: "1.0",
        },
        {
          type: "input",
          label: "height",
          info: "height",
          defaultValue: "1.0",
        },
        {
          type: "input",
          label: "angle",
          info: "angle",
          defaultValue: "360.0",
        },
      ],
      onSubmit: (values) => {
        store.dispatch(makeCylinderAsync(values))
      },
    },
  },
  {
    label: "Cone",
    img: Cone,
    action: () => store.dispatch(setOperationPanel("Cone")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Cylinder",
      chooseCount: 0,
      chooseLabelList: [],
      chooseTypeList: [],
      props: [
        {
          type: "input",
          label: "radius1",
          info: "radius1",
          defaultValue: "0.0",
        },
        {
          type: "input",
          label: "radius2",
          info: "radius2",
          defaultValue: "1.0",
        },
        {
          type: "input",
          label: "height",
          info: "height",
          defaultValue: "1.0",
        },
      ],
      onSubmit: (values) => {
        store.dispatch(makeConeAsync(values))
      },
    },
  },
  {
    label: "Sphere",
    img: Sphere,
    action: () => store.dispatch(setOperationPanel("Sphere")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Sphere",
      chooseCount: 0,
      chooseLabelList: [],
      chooseTypeList: [],
      props: [
        {
          type: "input",
          label: "radius",
          info: "radius",
          defaultValue: "1.0",
        },
        {
          type: "input",
          label: "angle",
          info: "angle",
          defaultValue: "360.0",
        },
      ],
      onSubmit: (values) => {
        store.dispatch(makeSphereAsync(values))
      },
    },
  },
  {
    label: "Torus",
    img: Torus,
    action: () => store.dispatch(setOperationPanel("Torus")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Torus",
      chooseCount: 0,
      chooseLabelList: [],
      chooseTypeList: [],
      props: [
        {
          type: "input",
          label: "radius1",
          info: "radius1",
          defaultValue: "1.0",
        },
        {
          type: "input",
          label: "radius2",
          info: "radius2",
          defaultValue: "2.0",
        },
        {
          type: "input",
          label: "angle",
          info: "angle",
          defaultValue: "360.0",
        },
      ],
      onSubmit: (values) => {
        store.dispatch(makeTorusAsync(values))
      },
    },
  },
  {
    label: "delimiter2",
    img: "",
    action: () => {
      console.log("delimiter")
    },
    isDelimiter: true,
  },
  {
    label: "Boolean",
    img: Boolean,
    action: () => store.dispatch(setOperationPanel("Boolean")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Boolean",
      chooseCount: 2,
      chooseLabelList: ["Solid1", "Solid2"],
      chooseTypeList: ["solid", "solid"],
      props: [
        {
          type: "select",
          label: "type",
          info: "type",
          defaultValue: "union",
          options: ["union", "intersection", "difference"],
        },
      ],
      onSubmit: (values) => {
        store.dispatch(booleanAsync(values))
      },
    },
  },
  {
    label: "Union",
    img: Fuse,
    action: () => store.dispatch(setOperationPanel("Union")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Union",
      chooseCount: 2,
      chooseLabelList: ["Solid1", "Solid2"],
      chooseTypeList: ["solid", "solid"],
      props: [],
      onSubmit: (values) => {
        store.dispatch(unionAsync(values))
      },
    },
  },
  {
    label: "Difference",
    img: Cut,
    action: () => store.dispatch(setOperationPanel("Difference")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Difference",
      chooseCount: 2,
      chooseLabelList: ["Solid1", "Solid2"],
      chooseTypeList: ["solid", "solid"],
      props: [],
      onSubmit: (values) => {
        store.dispatch(differenceAsync(values))
      },
    },
  },
  {
    label: "Intersection",
    img: Common,
    action: () => store.dispatch(setOperationPanel("Intersection")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Intersection",
      chooseCount: 2,
      chooseLabelList: ["Solid1", "Solid2"],
      chooseTypeList: ["solid", "solid"],
      props: [],
      onSubmit: (values) => {
        store.dispatch(intersectionAsync(values))
      },
    },
  },
  {
    label: "delimiter3",
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
    abled: (historyChecking: boolean) => historyChecking === false,
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
  {
    label: "Chamfer",
    img: chamfer,
    action: () => store.dispatch(setOperationPanel("Chamfer")),
    abled: (historyChecking: boolean) => historyChecking === false,
    operationSetting: {
      operationName: "Chamfer",
      chooseCount: 1,
      chooseLabelList: ["Edge"],
      chooseTypeList: ["edge"],
      props: [
        {
          type: "input",
          label: "length",
          info: "length",
          defaultValue: 0.1,
        },
      ],
      onSubmit: (values) => {
        store.dispatch(chamferAsync(values))
      },
    },
  },
  {
    label: "Rollback",
    icon: (className) => <RollbackOutlined className={className} />,
    action: () => {
      console.log("It cannot happen! how can you did it!")
    },
    unvisibleInOperationList: true,
    hoverContent: (
      <div>
        Rollback to the previous operation
        <br /> which with blue outline.
      </div>
    ),
  },
]

export default operationList
