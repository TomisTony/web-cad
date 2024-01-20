import { createSlice } from "@reduxjs/toolkit"
import { BrCAD } from "@/types/BrCAD"
import { RootState } from "@/app/store"

interface ModelState {
  model: BrCAD
  operations: any[]
}

const initialState: ModelState = {
  model: {} as BrCAD,
  operations: [],
}

export const modelSlice = createSlice({
  name: "model",
  initialState,
  reducers: {
    loadModel: (state, action) => {
      state.model = action.payload.model
      state.operations.push(action.payload.oprationId)
    },
    loadDiff: (state, action) => {
      state.model = action.payload.model
      state.operations.push(action.payload.oprationId)
    },
  },
})

export const selectModel = (state: RootState) => state.model.model
export default modelSlice.reducer
