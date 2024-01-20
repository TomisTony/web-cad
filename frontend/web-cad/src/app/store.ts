import { configureStore } from "@reduxjs/toolkit"
import modelReducer from "@/store/model/modelSlice"
import globalStatusReducer from "@/store/globalStatus/globalStatusSlice"

const store = configureStore({
  reducer: {
    model: modelReducer,
    globalStatus: globalStatusReducer,
  },
})
export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
