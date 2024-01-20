import { Shape } from "@/shape/shape"
import { ThreeApp } from "@/three/threeApp"
import apis from "@/apis"
import { modelSlice } from "./modelSlice"
import { setOperationExecuting } from "../globalStatus/globalStatusAction"

// 每个 case reducer 函数会生成对应的 Action creators
const { loadModel, loadDiff } = modelSlice.actions

export const loadModelAsync = () => (dispatch: any) => {
  dispatch(setOperationExecuting(true))

  apis.getModel().then((data) => {
    ThreeApp.getScene().clearScene()
    Shape.setBrCADToScene(data.model)
    dispatch(loadModel(data))
    dispatch(setOperationExecuting(false))
  })
}
export const loadDiffAsync = () => (dispatch: any, getState: any) => {
  dispatch(setOperationExecuting(true))

  const lastOperationId =
    getState().model.operations[getState().model.operations.length - 1]
  apis.getDiff(lastOperationId).then((data) => {
    ThreeApp.getScene().clearScene()
    let model = getState().model.model
    model = Shape.applyDiffToBrCAD(model, data.diff)
    Shape.setBrCADToScene(model)
    dispatch(loadDiff({ oprationId: data.oprationId, model }))
    dispatch(setOperationExecuting(false))
  })
}
