import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"

function StateListener() {
  const dispatch = useAppDispatch()
  const nowHistoryIndex = useAppSelector(
    (state) => state.history.nowHistoryIndex,
  )
  const historyList = useAppSelector((state) => state.history.historyList)

  // 自动设置 historyChecking
  useEffect(() => {
    if (nowHistoryIndex === historyList.length - 1) {
      dispatch({ type: "history/setHistoryChecking", payload: false })
    } else {
      dispatch({ type: "history/setHistoryChecking", payload: true })
    }
  }, [nowHistoryIndex, historyList])

  return <></>
}

export default StateListener
