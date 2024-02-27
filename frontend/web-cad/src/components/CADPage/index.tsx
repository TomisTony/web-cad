import React, { useEffect } from "react"
import { useParams } from "react-router-dom"

import MainContent from "./components/MainContent"
import Modals from "./components/Modals"
import Message from "./components/Message"
import StateListener from "./components/StateListener"
import { useDispatch } from "react-redux"
import { setProjectId } from "@/store/globalStatus/globalStatusAction"

function CADPage() {
  const { projectId } = useParams()
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(setProjectId(parseInt(projectId || "0")))
  }, [projectId])

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
