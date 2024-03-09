import { globalStatusSlice } from "./globalStatusSlice"

export const {
  setOperationExecuting,
  setHistoryChecking,
  setModal,
  setOperationPanel,
  setSidePanelVisible,
  setGlobalMessage,
  setProjectId,
  setProjectInfo,
} = globalStatusSlice.actions
