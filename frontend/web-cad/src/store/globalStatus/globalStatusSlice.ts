import { createSlice } from "@reduxjs/toolkit"

interface GlobalStatusState {
  operationExecuting: boolean // 是否有操作正在执行
  modal: string // 空字符串表示没有 Modal 触发，否则为 Modal 的名称
  operationPanel: string // 空字符串表示没有 OperationPanel 触发，否则为 OperationPanel 的名称
  sidePanelVisible: boolean // 是否显示 SidePanel
  message: {
    type: "success" | "error" | "info" | "warning" | undefined
    content: string
  }
}

const initialState: GlobalStatusState = {
  operationExecuting: false,
  modal: "",
  operationPanel: "",
  sidePanelVisible: false,
  message: {
    type: undefined,
    content: "",
  },
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
    setOperationPanel: (state, action) => {
      state.operationPanel = action.payload
    },
    setSidePanelVisible: (state, action) => {
      state.sidePanelVisible = action.payload
    },
    setMessage: (state, action) => {
      state.message = action.payload
    },
  },
})

export default globalStatusSlice.reducer
