import React, { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { message } from "antd"

const Message = () => {
  const messageInfo = useAppSelector(
    (state) => state.globalStatus.globalMessage,
  )
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (messageInfo.type) {
      const type = messageInfo?.type
      const content = messageInfo?.content || ""
      message[type](content)
      dispatch({
        type: "globalStatus/setGlobalMessage",
        payload: { type: undefined, content: "" },
      })
    }
  }, [messageInfo])

  return <></>
}

export default Message
