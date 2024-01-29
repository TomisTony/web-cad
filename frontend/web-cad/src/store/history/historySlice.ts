import { createSlice } from "@reduxjs/toolkit"
import { History } from "@/types/History"

interface HistoryState {
  historyList: History[]
  choosedHistoryIndex: number // 被选中的历史记录的索引
  nowHistoryIndex: number // 当前所在的历史记录的索引
}

const initialState: HistoryState = {
  historyList: [],
  choosedHistoryIndex: -1,
  nowHistoryIndex: -1,
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
  },
})

export default historySlice.reducer
