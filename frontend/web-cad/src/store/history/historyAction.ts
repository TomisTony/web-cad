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
    dispatch(setNowHistoryIndex(index))
  }

export const operationDoneUpdateHistoryChooseAndNowIndex =
  () => (dispatch: any) => {
    dispatch(nowHistoryIndexIncrement())
    dispatch(chooseNowHistory())
  }
