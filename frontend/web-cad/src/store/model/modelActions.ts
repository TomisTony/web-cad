import { Shape } from "@/shape/Shape"
import { ThreeApp } from "@/three/ThreeApp"
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
import { ThreeScene } from "@/three/ThreeScene"

// 每个 case reducer 函数会生成对应的 Action creators
export const {
  importFile: importFileAction,
  fillet,
  setModel,
  setChoosedInfo,
  addChoosedInfo,
  setChoosedInfos,
  setChoosedSolidIdList,
  unchoose,
  clearChoosedInfo,
  setIdSolidIdMap,
  setSolidIdEdgeIdMap,
  setSolidIdFaceIdMap,
  setSolidIdNameMap,
  setStructureMap,
} = modelSlice.actions

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

export const renameAsync = (value: any) => (dispatch: any, getState: any) => {
  console.log("renameAsync")
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
    .rename(params)
    .then((data) => {
      const { diff } = data
      ThreeApp.getScene().clearScene()
      let model = getState().model.model
      model = Shape.applyDiffToBrCAD(model, diff)
      Shape.setBrCADToScene(model)
      dispatch(setModel(model))
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

export const transformAsync =
  (value: any) => (dispatch: any, getState: any) => {
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
      .transform(params)
      .then((data) => {
        const { diff } = data
        ThreeApp.getScene().clearScene()
        let model = getState().model.model
        model = Shape.applyDiffToBrCAD(model, diff)
        Shape.setBrCADToScene(model)
        dispatch(setModel(model))
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
      const { model: oldModel } = res
      ThreeApp.getScene().clearScene()
      Shape.setBrCADToScene(oldModel)
      dispatch(setModel(oldModel))
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

export const setChoosedInfosAndHighlightManually =
  (choosedIdList: string[], typeList: string[], threeScene: ThreeScene) =>
  (dispatch: any, getState: any) => {
    threeScene.clearChoosedHighlight(getState().model.choosedIdList)
    threeScene.chooseHighlight(choosedIdList)
    // 必须先 toogle（clear and set） Highlight，再设置 choosedInfo,因为 toogle 函数中
    // 会用到 set 前的 choosedInfo 来作为基准
    dispatch(setChoosedInfos({ idList: choosedIdList, typeList }))
  }
