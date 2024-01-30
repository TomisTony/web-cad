import { Shape } from "@/shape/shape"
import { ThreeApp } from "@/three/threeApp"
import apis from "@/apis"
import { modelSlice } from "./modelSlice"
import {
  setOperationExecuting,
  setGlobalMessage,
} from "../globalStatus/globalStatusAction"
import { BrCAD } from "@/types/BrCAD"
import {
  setNowHistoryIndex,
  setNowHistoryIndexAndHistoryCheckingByOperationId,
} from "../history/historyAction"

// 每个 case reducer 函数会生成对应的 Action creators
const { importFile: importFileAction, fillet, setModel } = modelSlice.actions

export const importFile = (data: { model: BrCAD }) => (dispatch: any) => {
  dispatch(setOperationExecuting(true))
  ThreeApp.getScene().clearScene()
  Shape.setBrCADToScene(data.model)
  dispatch(importFileAction(data))
  dispatch({ type: "history/nowHistoryIndexIncrement" })
  dispatch(setOperationExecuting(false))
}
export const filletAsync = (value: any) => (dispatch: any, getState: any) => {
  dispatch(setOperationExecuting(true))

  const lastOperationId =
    getState().model.operations[getState().model.operations.length - 1]
  const params = {
    lastOperationId,
    projectId: 1,
    data: {
      ...value,
    },
  }
  apis
    .fillet(params)
    .then((data) => {
      const { oprationId, diff } = data
      ThreeApp.getScene().clearScene()
      let model = getState().model.model
      model = Shape.applyDiffToBrCAD(model, diff)
      Shape.setBrCADToScene(model)
      dispatch(fillet({ oprationId, model }))
      dispatch({ type: "history/nowHistoryIndexIncrement" })
    })
    .catch((err) => {
      dispatch(
        setGlobalMessage({
          type: "error",
          content: "Error: Server Error! Check the console.",
        }),
      )
    })
    .finally(() => {
      dispatch(setOperationExecuting(false))
    })
}

export const setSceneToOperationModalAsync =
  (operationId: number) => (dispatch: any) => {
    dispatch(setOperationExecuting(true))
    apis.getModel(operationId).then((data) => {
      ThreeApp.getScene().clearScene()
      Shape.setBrCADToScene(data.model)
      dispatch(setModel(data.model))
    })
    dispatch(setNowHistoryIndexAndHistoryCheckingByOperationId(operationId))
    dispatch(setOperationExecuting(false))
  }
