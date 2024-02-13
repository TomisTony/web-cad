import apis from "@/apis"
import { setGlobalMessage } from "../globalStatus/globalStatusAction"
import { historySlice } from "./historySlice"
import { setSceneToOperationModalAsync } from "../model/modelActions"
import { get } from "http"

export const {
  setHistoryList,
  chooseHistory,
  setNowHistoryIndex,
  nowHistoryIndexIncrement,
  chooseNowHistory,
  setRollbackMap,
  setRollbackHighlightIndex,
} = historySlice.actions

export const refreshHistoryList = (historyList: any) => (dispatch: any) => {
  dispatch(setHistoryList(historyList))
}

export const setNowHistoryIndexByOperationId =
  (operationId: any) => (dispatch: any, getState: any) => {
    const historyList = getState().history.historyList
    const index = historyList.findIndex(
      (item: any) => item.operationId === operationId,
    )
    dispatch(setNowHistoryIndex(index))
  }

export const operationDoneUpdateHistoryChooseAndNowIndex =
  () => (dispatch: any) => {
    dispatch(nowHistoryIndexIncrement())
    dispatch(chooseNowHistory())
  }

export const deleteLastHistoryAsync =
  (operationId: number) => (dispatch: any, getState: any) => {
    apis
      .deleteProjectHistory({
        operationId: operationId,
        projectId: getState().globalStatus.projectId,
        data: {},
      })
      .then((res: any) => {
        dispatch(setGlobalMessage({ content: res, type: "success" }))
        const lastId = getState().history.choosedHistoryIndex - 1
        dispatch({
          type: "history/chooseHistory",
          payload: lastId,
        })
        dispatch(
          setSceneToOperationModalAsync(
            getState().history.historyList[lastId].operationId,
          ),
        )
      })
      .catch((err) => {
        dispatch(
          setGlobalMessage({
            type: "error",
            content: "Error: Server Error! Check the console.",
          }),
        )
      })
  }

export const deleteProjectHistoryAsync =
  (operationId: number) => (dispatch: any, getState: any) => {
    apis
      .deleteProjectHistory({
        operationId,
        projectId: getState().globalStatus.projectId,
        data: {},
      })
      .then((res) => {
        dispatch(
          setGlobalMessage({
            content: "Rollback with no Concatenation Mode success",
            type: "success",
          }),
        )
        dispatch({
          type: "history/chooseHistory",
          payload: getState().history.choosedHistoryIndex,
        })
        dispatch(
          setSceneToOperationModalAsync(
            getState().history.historyList[
              getState().history.choosedHistoryIndex
            ].operationId,
          ),
        )
      })
  }
