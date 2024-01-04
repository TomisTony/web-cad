import { createSlice } from "@reduxjs/toolkit"
import { getDiff, getOutput } from "./output.temp"
import { BrCAD } from "src/types/BrCAD"

interface ModelState {
  model: BrCAD
}

const initialState: ModelState = {
  model: {} as BrCAD,
}

export const counterSlice = createSlice({
  name: "model",
  initialState,
  reducers: {
    loadModel: (state) => {
      state.model = await getOutput()
    },
    loadDiff: (state) => {
      state.model = await getDiff()
    },
  },
})
// 每个 case reducer 函数会生成对应的 Action creators
export const { loadModel, loadDiff } = counterSlice.actions

export default counterSlice.reducer
