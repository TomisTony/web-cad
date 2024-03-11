import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"

function StateListener() {
  const dispatch = useAppDispatch()
  const nowHistoryIndex = useAppSelector(
    (state) => state.history.nowHistoryIndex,
  )
  const choosedHistoryIndex = useAppSelector(
    (state) => state.history.choosedHistoryIndex,
  )
  const historyList = useAppSelector((state) => state.history.historyList)
  const rollbackMap = useAppSelector((state) => state.history.rollbackMap)
  const choosedIdList = useAppSelector((state) => state.model.choosedIdList)
  const idSolidIdMap = useAppSelector((state) => state.model.idSolidIdMap)

  // 自动设置 historyChecking
  useEffect(() => {
    if (nowHistoryIndex === historyList.length - 1) {
      dispatch({ type: "globalStatus/setHistoryChecking", payload: false })
    } else {
      dispatch({ type: "globalStatus/setHistoryChecking", payload: true })
    }
  }, [nowHistoryIndex, historyList])

  // 自动设置 rollbackHighlightIndex
  useEffect(() => {
    // 当 choosedHistoryIndex 是 rollback 操作时，设置 rollbackHighlightIndex
    if (historyList[choosedHistoryIndex]?.operationName === "Rollback") {
      dispatch({
        type: "history/setRollbackHighlightIndex",
        payload: rollbackMap[historyList[choosedHistoryIndex].operationId],
      })
    } else {
      dispatch({
        type: "history/setRollbackHighlightIndex",
        payload: -1,
      })
    }
  }, [choosedHistoryIndex, historyList, rollbackMap])

  // 自动设置 rollbackMap
  useEffect(() => {
    const rollbackMap: { [key: number]: number } = {}
    historyList.forEach((history) => {
      if (history.operationName !== "Rollback") return
      rollbackMap[history.operationId] =
        history.operationSubmitValues?.props?.rollbackId
    })
    dispatch({ type: "history/setRollbackMap", payload: rollbackMap })
  }, [historyList])

  // 自动设置 choosedSolidIdList
  useEffect(() => {
    const solidIdList = choosedIdList.map((id) => idSolidIdMap[id])
    dispatch({ type: "model/setChoosedSolidIdList", payload: solidIdList })
  }, [choosedIdList, idSolidIdMap])

  return <></>
}

export default StateListener
