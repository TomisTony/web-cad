import { globalStatusSlice } from "./globalStatusSlice"

export const {
  setOperationExecuting,
  setHistoryChecking,
  setModal,
  setOperationPanel,
  setSidePanelVisible,
  setGlobalMessage,
  setProjectId,
} = globalStatusSlice.actions
