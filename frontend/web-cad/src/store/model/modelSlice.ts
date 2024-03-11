import { createSlice } from "@reduxjs/toolkit"
import { BrCAD } from "@/types/BrCAD"
import { RootState } from "@/app/store"

interface ModelState {
  model: BrCAD // 储存当前的模型
  solidIdNameMap: { [key: string]: string } // solidId 到 solidName 的映射
  solidIdFaceIdMap: { [key: string]: string } // solidId 到 faceId 的映射
  solidIdEdgeIdMap: { [key: string]: string } // solidId 到 edgeId 的映射
  idSolidIdMap: { [key: string]: string } // id 到 solidId 的映射
  choosedIdList: string[] // 当前选中的对象的 id
  choosedTypeList: string[] // 当前选中的对象的类型,"edge"/"face"
  choosedSolidIdList: string[] // 当前选中的 solidIds
}

const initialState: ModelState = {
  model: {} as BrCAD,
  choosedIdList: [],
  choosedTypeList: [],
  choosedSolidIdList: [],
  solidIdNameMap: {},
  solidIdFaceIdMap: {},
  solidIdEdgeIdMap: {},
  idSolidIdMap: {},
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
    setChoosedInfos: (state, action) => {
      state.choosedIdList = action.payload.idList
      state.choosedTypeList = action.payload.typeList
    },
    setChoosedSolidIdList: (state, action) => {
      state.choosedSolidIdList = action.payload
    },
    clearChoosedInfo: (state) => {
      state.choosedIdList = []
      state.choosedTypeList = []
    },
    importFile: (state, action) => {
      state.model = action.payload.model
    },
    fillet: (state, action) => {
      state.model = action.payload.model
    },
    setModel: (state, action) => {
      state.model = action.payload
    },
    setSolidIdNameMap: (state, action) => {
      state.solidIdNameMap = action.payload
    },
    setSolidIdFaceIdMap: (state, action) => {
      state.solidIdFaceIdMap = action.payload
    },
    setSolidIdEdgeIdMap: (state, action) => {
      state.solidIdEdgeIdMap = action.payload
    },
    setIdSolidIdMap: (state, action) => {
      state.idSolidIdMap = action.payload
    },
    setStructureMap: (state, action) => {
      state.solidIdNameMap = action.payload.solidIdNameMap
      state.solidIdFaceIdMap = action.payload.solidIdFaceIdMap
      state.solidIdEdgeIdMap = action.payload.solidIdEdgeIdMap
      state.idSolidIdMap = action.payload.idSolidIdMap
    },
  },
})

export const selectModel = (state: RootState) => state.model.model
export default modelSlice.reducer
