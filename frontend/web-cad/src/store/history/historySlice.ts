import { createSlice } from "@reduxjs/toolkit"
import { History } from "@/types/History"

interface HistoryState {
  historyList: History[]
}

const initialState: HistoryState = {
  historyList: [],
}

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    addNewHistory: (state, action) => {
      state.historyList.push(action.payload)
    },
  },
})

export default historySlice.reducer
