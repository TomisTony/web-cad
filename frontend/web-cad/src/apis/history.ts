import request from "@/utils/request"
import { History } from "@/types/History"

export function getHistoryList(projectId: number) {
  return request.get<History[]>("/mytest/getProjectHistory?projectId=1")
}

export function deleteLastProjectHistory(data: any) {
  return request.post("/mytest/deleteLastProjectHistory", data)
}
