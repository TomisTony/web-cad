import { setHistoryChecking } from "../globalStatus/globalStatusAction"
import { historySlice } from "./historySlice"

export const {
  setHistoryList,
  chooseHistory,
  setNowHistoryIndex,
  nowHistoryIndexIncrement,
  chooseNowHistory,
} = historySlice.actions

export const refreshHistoryList = (historyList: any) => (dispatch: any) => {
  dispatch(setHistoryList(historyList))
}

export const setNowHistoryIndexAndHistoryCheckingByOperationId =
  (operationId: any) => (dispatch: any, getState: any) => {
    const historyList = getState().history.historyList
    const index = historyList.findIndex(
      (item: any) => item.operationId === operationId,
    )
    if (index !== historyList.length - 1) {
      dispatch(setHistoryChecking(true))
    }
    dispatch(setNowHistoryIndex(index))
  }

export const operationDoneUpdateHistoryChooseAndNowIndex =
  () => (dispatch: any) => {
    dispatch(nowHistoryIndexIncrement())
    dispatch(chooseNowHistory())
  }
