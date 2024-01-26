import { globalStatusSlice } from "./globalStatusSlice"

export const {
  setOperationExecuting,
  setModal,
  setOperationPanel,
  setSidePanelVisible,
  setGlobalMessage,
} = globalStatusSlice.actions
