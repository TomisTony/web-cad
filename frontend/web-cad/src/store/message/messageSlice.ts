import { createSlice } from "@reduxjs/toolkit"

interface MessageState {
  newCount: number // 未读消息数量
}

const initialState: MessageState = {
  newCount: 0,
}

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setNewCount: (state, action) => {
      state.newCount = action.payload
    },
  },
})

export default messageSlice.reducer
