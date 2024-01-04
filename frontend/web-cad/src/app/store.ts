import { configureStore } from "@reduxjs/toolkit"
import modelReducer from "../features/model/modelSlice"

const store = configureStore({
  reducer: {
    model: modelReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
