import React from "react"
import FunctionalButton from "./FunctionalButton"
import { useAppSelector, useAppDispatch } from "@/app/hooks"

interface FunctionalButtonListProps {
  className?: string
}

function FunctionalButtonList(props: FunctionalButtonListProps) {
  const dispatch = useAppDispatch()
  const choosedHistoryIndex = useAppSelector(
    (state) => state.history.choosedHistoryIndex,
  )
  const nowHistoryIndex = useAppSelector(
    (state) => state.history.nowHistoryIndex,
  )
  const historyList = useAppSelector((state) => state.history.historyList)
  const historyCount = historyList.length

  const functionalButtons = [
    {
      label: "Transfer",
      onClick: () => {},
      disabled: !(
        nowHistoryIndex !== choosedHistoryIndex && choosedHistoryIndex !== -1
      ),
    },
    {
      label: "Delete",
      onClick: () => {
        dispatch({ type: "globalStatus/setModal", payload: "deleteHistory" })
      },
      disabled: !(
        choosedHistoryIndex === historyCount - 1 && choosedHistoryIndex !== -1
      ),
    },
    {
      label: "Rollback",
      onClick: () => {
        dispatch({ type: "globalStatus/setModal", payload: "rollbackHistory" })
      },
      disabled: !(
        choosedHistoryIndex !== historyCount - 1 && choosedHistoryIndex !== -1
      ),
    },
  ]

  return (
    <div
      className={"flex flex-wrap justify-between " + (props.className ?? "")}
    >
      {functionalButtons.map((value, index) => {
        return (
          <FunctionalButton
            key={index}
            label={value.label}
            onClick={value.onClick}
            disabled={value.disabled}
          />
        )
      })}
    </div>
  )
}

export default FunctionalButtonList
