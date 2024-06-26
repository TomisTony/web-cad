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
  setModel,
  setChoosedInfo,
  addChoosedInfo,
  setChoosedInfos,
  setChoosedSolidIdList,
  unchoose,
  clearChoosedInfo,
  setIdSolidIdMap,
  setSolidIdNameMap,
  setStructureMap,
} = modelSlice.actions

const makeSomethingAsync =
  (api: (data: any) => Promise<any>) =>
  (value: any) =>
  (dispatch: any, getState: any) => {
    dispatch(setOperationExecuting(true))
    const historyList = getState().history.historyList
    const lastOperationId =
      historyList[historyList.length - 1]?.operationId ?? -1
    const projectId = getState().globalStatus.projectId
    const params = {
      lastOperationId,
      projectId,
      operatorId: getUserId(),
      data: {
        ...value,
      },
    }
    api(params)
      .then((data) => {
        const { diff, model: newModel } = data
        if (newModel) {
          ThreeApp.getScene().clearScene()
          Shape.setBrCADToScene(newModel)
          dispatch(setModel(newModel))
          dispatch(operationDoneUpdateHistoryChooseAndNowIndex())
        } else {
          ThreeApp.getScene().clearScene()
          let model = getState().model.model
          model = Shape.applyDiffToBrCAD(model, diff)
          Shape.setBrCADToScene(model)
          dispatch(setModel(model))
          dispatch(operationDoneUpdateHistoryChooseAndNowIndex())
        }
      })
      .catch((err) => {
        console.log("fuck" + err)
        dispatch(
          setGlobalMessage({
            type: "error",
            content: err || "Error: Server Error! Check the console.",
          }),
        )
      })
      .finally(() => {
        dispatch(setOperationExecuting(false))
      })
  }

const makeOperationAsync =
  (api: (data: any) => Promise<any>) =>
  (value: any) =>
  (dispatch: any, getState: any) => {
    dispatch(setOperationExecuting(true))
    const historyList = getState().history.historyList
    const lastOperationId =
      historyList[historyList.length - 1]?.operationId ?? -1
    const projectId = getState().globalStatus.projectId
    const params = {
      lastOperationId,
      projectId,
      operatorId: getUserId(),
      data: {
        ...value,
      },
    }
    api(params)
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
            content: err || "Error: Server Error! Check the console.",
          }),
        )
      })
      .finally(() => {
        dispatch(setOperationExecuting(false))
      })
  }

export const importFile = (data: any) => (dispatch: any, getState: any) => {
  const { model: newModel, diff } = data
  dispatch(setOperationExecuting(true))
  ThreeApp.getScene().clearScene()
  let model
  if (newModel) {
    model = newModel
  } else {
    model = Shape.applyDiffToBrCAD(getState().model.model, diff)
  }
  Shape.setBrCADToScene(model)
  dispatch(setModel(model))
  dispatch(operationDoneUpdateHistoryChooseAndNowIndex())
  dispatch(setOperationExecuting(false))
}

export const filletAsync = makeOperationAsync(apis.fillet)

export const chamferAsync = makeOperationAsync(apis.chamfer)

export const renameAsync = makeOperationAsync(apis.rename)

export const transformAsync = makeOperationAsync(apis.transform)

export const deleteAsync = makeOperationAsync(apis.deleteSolid)

export const makeBoxAsync = makeSomethingAsync(apis.makeBox)

export const makeCylinderAsync = makeSomethingAsync(apis.makeCylinder)

export const makeConeAsync = makeSomethingAsync(apis.makeCone)

export const makeSphereAsync = makeSomethingAsync(apis.makeSphere)

export const makeTorusAsync = makeSomethingAsync(apis.makeTorus)

export const booleanAsync = makeOperationAsync(apis.boolean)

export const unionAsync = makeOperationAsync(apis.union)

export const intersectionAsync = makeOperationAsync(apis.intersection)

export const differenceAsync = makeOperationAsync(apis.difference)

// rollback 在 nowHistoryIndex 和 chooseHistory 的处理逻辑与正常的 operation 不同
export const rollbackAsync = (value: any) => (dispatch: any, getState: any) => {
  dispatch(setOperationExecuting(true))
  const historyList = getState().history.historyList
  const lastOperationId = historyList[historyList.length - 1]?.operationId ?? -1
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
    apis
      .getModel(operationId)
      .then((data) => {
        ThreeApp.getScene().clearScene()
        Shape.setBrCADToScene(data.model)
        dispatch(setModel(data.model))
      })
      .catch((err) => {
        console.error(err)
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
