import React, { useEffect } from "react"

import { socket } from "@/utils/socket"

import MainContent from "./components/MainContent"
import Modals from "./components/Modals"
import Message from "./components/Message"

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("websocket connect")
    })
    return () => {
      socket.off("connect")
      socket.disconnect()
    }
  }, [])

  return (
    <div>
      <MainContent />
      <Message />
      <Modals />
    </div>
  )
}

export default App
