import React from "react"
import { useParams } from "react-router-dom"

import MainContent from "./components/MainContent"
import Modals from "./components/Modals"
import Message from "./components/Message"
import StateListener from "./components/Modals/StateListener"
import { setProjectId } from "@/store/globalStatus/globalStatusAction"

function CADPage() {
  const { projectId } = useParams()
  setProjectId(parseInt(projectId || "0"))

  return (
    <div>
      <MainContent />
      <Message />
      <Modals />
      <StateListener />
    </div>
  )
}

export default CADPage
