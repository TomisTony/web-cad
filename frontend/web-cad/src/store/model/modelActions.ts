import { Shape } from "@/shape/shape"
import { ThreeApp } from "@/three/threeApp"
import apis from "@/apis"
import { modelSlice } from "./modelSlice"
import { setOperationExecuting } from "../globalStatus/globalStatusAction"
import { BrCAD } from "@/types/BrCAD"

// 每个 case reducer 函数会生成对应的 Action creators
const { importFile: importFileAction, fillet } = modelSlice.actions

export const importFile = (data: { model: BrCAD }) => (dispatch: any) => {
  dispatch(setOperationExecuting(true))
  ThreeApp.getScene().clearScene()
  Shape.setBrCADToScene(data.model)
  dispatch(importFileAction(data))
  dispatch(setOperationExecuting(false))
}
export const filletAsync = () => (dispatch: any, getState: any) => {
  dispatch(setOperationExecuting(true))

  const lastOperationId =
    getState().model.operations[getState().model.operations.length - 1]
  apis.fillet(lastOperationId).then((data) => {
    ThreeApp.getScene().clearScene()
    let model = getState().model.model
    model = Shape.applyDiffToBrCAD(model, data.diff)
    Shape.setBrCADToScene(model)
    dispatch(fillet({ oprationId: data.oprationId, model }))
    dispatch(setOperationExecuting(false))
  })
}
