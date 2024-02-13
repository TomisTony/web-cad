import request from "@/utils/request"
import { History } from "@/types/History"

export function getHistoryList(projectId: number) {
  return request.get<History[]>("/cad/getProjectHistory?projectId=" + projectId)
}

export function deleteProjectHistory(data: any) {
  return request.post("/cad/deleteProjectHistory", data)
}
