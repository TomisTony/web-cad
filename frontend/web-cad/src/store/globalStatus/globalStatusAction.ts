import { globalStatusSlice } from "./globalStatusSlice"

export const {
  setOperationExecuting,
  setModal,
  setOperationPanel,
  setSidePanelVisible,
  setMessage,
} = globalStatusSlice.actions
