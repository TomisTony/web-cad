import React from "react"

import MainContent from "./components/MainContent"
import Modals from "./components/Modals"
import Message from "./components/Message"
import StateListener from "./components/Modals/StateListener"

function App() {
  return (
    <div>
      <MainContent />
      <Message />
      <Modals />
      <StateListener />
    </div>
  )
}

export default App
