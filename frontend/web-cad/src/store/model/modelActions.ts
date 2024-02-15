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
  operationDoneUpdateHistoryChooseAndNowIndex,
  setNowHistoryIndex,
  setNowHistoryIndexByOperationId,
  chooseHistory,
} from "../history/historyAction"
import { getUserId } from "@/utils/localStorage"

// 每个 case reducer 函数会生成对应的 Action creators
const { importFile: importFileAction, fillet, setModel } = modelSlice.actions

export const importFile = (data: { model: BrCAD }) => (dispatch: any) => {
  dispatch(setOperationExecuting(true))
  ThreeApp.getScene().clearScene()
  Shape.setBrCADToScene(data.model)
  dispatch(importFileAction(data))
  dispatch(operationDoneUpdateHistoryChooseAndNowIndex())
  dispatch(setOperationExecuting(false))
}
export const filletAsync = (value: any) => (dispatch: any, getState: any) => {
  dispatch(setOperationExecuting(true))
  const historyList = getState().history.historyList
  const lastOperationId = historyList[historyList.length - 1].operationId
  const projectId = getState().globalStatus.projectId
  const params = {
    lastOperationId,
    projectId,
    operatorId: getUserId(),
    data: {
      ...value,
    },
  }
  apis
    .fillet(params)
    .then((data) => {
      const { diff } = data
      ThreeApp.getScene().clearScene()
      let model = getState().model.model
      model = Shape.applyDiffToBrCAD(model, diff)
      Shape.setBrCADToScene(model)
      dispatch(fillet({ model }))
      dispatch(operationDoneUpdateHistoryChooseAndNowIndex())
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

export const rollbackAsync = (value: any) => (dispatch: any, getState: any) => {
  dispatch(setOperationExecuting(true))
  const historyList = getState().history.historyList
  const lastOperationId = historyList[historyList.length - 1].operationId
  const historyListLength = historyList.length
  const projectId = getState().globalStatus.projectId
  apis
    .rollback({
      lastOperationId,
      projectId,
      operatorId: getUserId(),
      data: {
        choosedIdList: [],
        choosedTypeList: [],
        props: {
          rollbackId: value.rollbackId,
        },
      },
    })
    .then((res) => {
      const { diff } = res
      ThreeApp.getScene().clearScene()
      let model = getState().model.model
      model = Shape.applyDiffToBrCAD(model, diff)
      Shape.setBrCADToScene(model)
      dispatch(setModel(model))
      dispatch({
        type: "history/setNowHistoryIndex",
        payload: historyListLength,
      })
      dispatch({
        type: "history/chooseHistory",
        payload: historyListLength,
      })
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
    dispatch(setNowHistoryIndexByOperationId(operationId))
    dispatch(setOperationExecuting(false))
  }

export const setSceneToInit = () => (dispatch: any) => {
  dispatch(setOperationExecuting(true))
  ThreeApp.getScene().clearScene()
  dispatch(setModel({}))
  dispatch(setOperationExecuting(false))
  dispatch(setNowHistoryIndex(-1))
  dispatch(chooseHistory(-1))
}
