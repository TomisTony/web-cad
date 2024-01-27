import { configureStore } from "@reduxjs/toolkit"
import modelReducer from "@/store/model/modelSlice"
import globalStatusReducer from "@/store/globalStatus/globalStatusSlice"
import messageReducer from "@/store/message/messageSlice"
import historyReducer from "@/store/history/historySlice"

const store = configureStore({
  reducer: {
    model: modelReducer,
    globalStatus: globalStatusReducer,
    message: messageReducer,
    history: historyReducer,
  },
})
export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
