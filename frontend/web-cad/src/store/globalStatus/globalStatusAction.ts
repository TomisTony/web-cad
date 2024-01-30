import { globalStatusSlice } from "./globalStatusSlice"

export const {
  setOperationExecuting,
  setHistoryChecking,
  setModal,
  setOperationPanel,
  setSidePanelVisible,
  setGlobalMessage,
} = globalStatusSlice.actions
