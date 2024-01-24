import React, { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { message } from "antd"

const Message = () => {
  const messageInfo = useAppSelector((state) => state.globalStatus.message)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (messageInfo.type) {
      const type = messageInfo?.type
      const content = messageInfo?.content || ""
      message[type](content)
      dispatch({
        type: "globalStatus/setMessage",
        payload: { type: undefined, content: "" },
      })
    }
  }, [messageInfo])

  return <></>
}

export default Message
