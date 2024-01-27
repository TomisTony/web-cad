import React from "react"
import FunctionalButton from "./FunctionalButton"
import { useAppSelector } from "@/app/hooks"

interface FunctionalButtonListProps {
  className?: string
}

function FunctionalButtonList(props: FunctionalButtonListProps) {
  const choosedHistoryIndex = useAppSelector(
    (state) => state.history.choosedHistoryIndex,
  )
  const nowHistoryIndex = useAppSelector(
    (state) => state.history.nowHistoryIndex,
  )
  const historyCount = useAppSelector((state) => state.history.historyCount)

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
      onClick: () => {},
      disabled: !(choosedHistoryIndex === historyCount - 1),
    },
    {
      label: "Rollback",
      onClick: () => {},
      disabled: !(choosedHistoryIndex !== historyCount - 1),
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
