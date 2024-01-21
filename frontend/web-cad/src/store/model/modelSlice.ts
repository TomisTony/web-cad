import { createSlice } from "@reduxjs/toolkit"
import { BrCAD } from "@/types/BrCAD"
import { RootState } from "@/app/store"

interface ModelState {
  model: BrCAD // 储存当前的模型
  operations: any[] // 操作历史记录
}

const initialState: ModelState = {
  model: {} as BrCAD,
  operations: [],
}

export const modelSlice = createSlice({
  name: "model",
  initialState,
  reducers: {
    importFile: (state, action) => {
      state.model = action.payload.model
      state.operations.push(action.payload.oprationId)
    },
    fillet: (state, action) => {
      state.model = action.payload.model
      state.operations.push(action.payload.oprationId)
    },
  },
})

export const selectModel = (state: RootState) => state.model.model
export default modelSlice.reducer
