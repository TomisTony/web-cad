import { createSlice } from "@reduxjs/toolkit"
import { getDiff, getOutput } from "./output.temp"
import { BrCAD } from "@/types/BrCAD"
import { RootState } from "@/app/store"
import { Shape } from "@/shape/shape"
import { ThreeApp } from "@/three/threeApp"

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
    loadModel: (state, action) => {
      state.model = action.payload
    },
    loadDiff: (state, action) => {
      state.model = action.payload
    },
  },
})

// 每个 case reducer 函数会生成对应的 Action creators
const { loadModel, loadDiff } = counterSlice.actions

export const loadModelAsync = () => (dispatch: any) => {
  getOutput().then((model) => {
    ThreeApp.getInstance().clearScene()
    Shape.setBrCADToScene(model)
    dispatch(loadModel(model))
  })
}
export const loadDiffAsync = () => (dispatch: any, getState: any) => {
  getDiff().then((diff) => {
    ThreeApp.getInstance().clearScene()
    let model = getState().model.model
    model = Shape.applyDiffToBrCAD(model, diff)
    Shape.setBrCADToScene(model)
    dispatch(loadDiff(model))
  })
}
export const selectModel = (state: RootState) => state.model.model
export default counterSlice.reducer
