import { createSlice } from "@reduxjs/toolkit"
import { History } from "@/types/History"

interface HistoryState {
  historyCount: number
  choosedHistoryIndex: number // 被选中的历史记录的索引
  nowHistoryIndex: number // 当前所在的历史记录的索引
}

const initialState: HistoryState = {
  historyCount: 0,
  choosedHistoryIndex: -1,
  nowHistoryIndex: 1,
}

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setHistoryCount: (state, action) => {
      state.historyCount = action.payload
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
