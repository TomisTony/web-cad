import { ProjectInfo } from "@/types/User"
import { createSlice } from "@reduxjs/toolkit"

interface GlobalStatusState {
  operationExecuting: boolean // 是否有操作正在执行
  historyChecking: boolean // 是否在历史记录查看状态
  modal: string // 空字符串表示没有 Modal 触发，否则为 Modal 的名称
  operationPanel: string // 空字符串表示没有 OperationPanel 触发，否则为 OperationPanel 的名称
  sidePanelVisible: boolean // 是否显示 SidePanel
  globalMessage: {
    // 全局消息提示
    type: "success" | "error" | "info" | "warning" | undefined
    content: string
  }
  projectId: number // 当前项目的 id
  projectInfo: ProjectInfo // 当前项目的信息
}

const initialState: GlobalStatusState = {
  operationExecuting: false,
  historyChecking: false,
  modal: "",
  operationPanel: "",
  sidePanelVisible: false,
  globalMessage: {
    type: undefined,
    content: "",
  },
  projectId: 0,
  projectInfo: {} as ProjectInfo,
}

export const globalStatusSlice = createSlice({
  name: "globalStatus",
  initialState,
  reducers: {
    setOperationExecuting: (state, action) => {
      state.operationExecuting = action.payload
    },
    setHistoryChecking: (state, action) => {
      state.historyChecking = action.payload
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
    setGlobalMessage: (state, action) => {
      state.globalMessage = action.payload
    },
    setProjectId: (state, action) => {
      state.projectId = action.payload
    },
    setProjectInfo: (state, action) => {
      state.projectInfo = action.payload
    },
  },
})

export default globalStatusSlice.reducer
