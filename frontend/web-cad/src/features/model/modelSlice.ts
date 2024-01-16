import { createSlice } from "@reduxjs/toolkit"
import apis from "@/apis"
import { BrCAD } from "@/types/BrCAD"
import { RootState } from "@/app/store"
import { Shape } from "@/shape/shape"
import { ThreeApp } from "@/three/threeApp"

interface ModelState {
  model: BrCAD
  operations: any[]
}

const initialState: ModelState = {
  model: {} as BrCAD,
  operations: [],
}

export const counterSlice = createSlice({
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

// 每个 case reducer 函数会生成对应的 Action creators
const { loadModel, loadDiff } = counterSlice.actions

export const loadModelAsync = () => (dispatch: any) => {
  apis.getModel().then((data) => {
    ThreeApp.getScene().clearScene()
    Shape.setBrCADToScene(data.model)
    dispatch(loadModel(data))
  })
}
export const loadDiffAsync = () => (dispatch: any, getState: any) => {
  const lastOperationId =
    getState().model.operations[getState().model.operations.length - 1]
  apis.getDiff(lastOperationId).then((data) => {
    ThreeApp.getScene().clearScene()
    let model = getState().model.model
    model = Shape.applyDiffToBrCAD(model, data.diff)
    Shape.setBrCADToScene(model)
    dispatch(loadDiff({ oprationId: data.oprationId, model }))
  })
}
export const selectModel = (state: RootState) => state.model.model
export default counterSlice.reducer
