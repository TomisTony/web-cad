import { createSlice } from "@reduxjs/toolkit"

interface GlobalStatusState {
  operationExecuting: boolean // 是否有操作正在执行
  modal: string // 空字符串表示没有 Modal 触发，否则为 Modal 的名称
}

const initialState: GlobalStatusState = {
  operationExecuting: false,
  modal: "",
}

export const globalStatusSlice = createSlice({
  name: "globalStatus",
  initialState,
  reducers: {
    setOperationExecuting: (state, action) => {
      state.operationExecuting = action.payload
    },
    setModal: (state, action) => {
      state.modal = action.payload
    },
  },
})

export default globalStatusSlice.reducer