import { createSlice } from "@reduxjs/toolkit"
import { History } from "@/types/History"

interface HistoryState {
  historyList: History[]
  choosedHistoryIndex: number // 被选中的历史记录的索引
  nowHistoryIndex: number // 当前所在的历史记录的索引
  rollbackMap: { [key: number]: number } // 回滚的映射表，key 为 operationId，value 为回滚到的历史记录的 operationId
  rollbackHighlightIndex: number // 由于回滚而被高亮的索引
}

const initialState: HistoryState = {
  historyList: [],
  choosedHistoryIndex: -1,
  nowHistoryIndex: -1,
  rollbackMap: {},
  rollbackHighlightIndex: -1,
}

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setHistoryList: (state, action) => {
      state.historyList = action.payload
    },
    chooseHistory: (state, action) => {
      state.choosedHistoryIndex = action.payload
    },
    setNowHistoryIndex: (state, action) => {
      state.nowHistoryIndex = action.payload
    },
    // 目前历史记录和 Operation 是错位更新的，所以需要手动更新
    nowHistoryIndexIncrement: (state) => {
      state.nowHistoryIndex++
    },
    chooseNowHistory: (state) => {
      state.choosedHistoryIndex = state.nowHistoryIndex
    },
    setRollbackMap: (state, action) => {
      state.rollbackMap = action.payload
    },
    setRollbackHighlightIndex: (state, action) => {
      state.rollbackHighlightIndex = action.payload
    },
  },
})

export default historySlice.reducer
