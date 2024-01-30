import { createSlice } from "@reduxjs/toolkit"
import { BrCAD } from "@/types/BrCAD"
import { RootState } from "@/app/store"

interface ModelState {
  model: BrCAD // 储存当前的模型
  choosedIdList: string[] // 当前选中的对象的 id
  choosedTypeList: string[] // 当前选中的对象的类型,"edge"/"face"
  operations: any[] // 操作历史记录
}

const initialState: ModelState = {
  model: {} as BrCAD,
  operations: [],
  choosedIdList: [],
  choosedTypeList: [],
}

export const modelSlice = createSlice({
  name: "model",
  initialState,
  reducers: {
    setChoosedInfo: (state, action) => {
      const { index, id, type } = action.payload
      state.choosedIdList[index] = id
      state.choosedTypeList[index] = type
    },
    addChoosedInfo: (state, action) => {
      const { id, type } = action.payload
      state.choosedIdList.push(id)
      state.choosedTypeList.push(type)
    },
    unchoose: (state, action) => {
      const { id } = action.payload
      const index = state.choosedIdList.indexOf(id)
      state.choosedIdList.splice(index, 1)
      state.choosedTypeList.splice(index, 1)
    },
    clearChoosedInfo: (state) => {
      state.choosedIdList = []
      state.choosedTypeList = []
    },
    importFile: (state, action) => {
      state.model = action.payload.model
      state.operations.push(action.payload.oprationId)
    },
    fillet: (state, action) => {
      state.model = action.payload.model
      state.operations.push(action.payload.oprationId)
    },
    setModel: (state, action) => {
      state.model = action.payload
    },
  },
})

export const selectModel = (state: RootState) => state.model.model
export default modelSlice.reducer
