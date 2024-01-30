import { historySlice } from "./historySlice"

export const { setHistoryList, chooseHistory, setNowHistoryIndex } =
  historySlice.actions

export const refreshHistoryList = (historyList: any) => (dispatch: any) => {
  dispatch(setHistoryList(historyList))
}
