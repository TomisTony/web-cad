import React from "react"
import { App } from "antd"

import ImportModal from "./components/ImportModal"
import ExportModal from "./components/ExportModal"
import DeleteHistoryModal from "./components/DeleteHistoryModal"
import RollbackHistoryModal from "./components/RollbackHistoryModal"

function Modals() {
  return (
    <App>
      <ExportModal />
      <ImportModal />
      <DeleteHistoryModal />
      <RollbackHistoryModal />
    </App>
  )
}

export default Modals
