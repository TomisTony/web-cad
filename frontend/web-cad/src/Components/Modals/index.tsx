import React from "react"
import { App } from "antd"

import ImportModal from "./components/ImportModal"
import ExportModal from "./components/ExportModal"

function Modals() {
  return (
    <App>
      <ExportModal />
      <ImportModal />
    </App>
  )
}

export default Modals
