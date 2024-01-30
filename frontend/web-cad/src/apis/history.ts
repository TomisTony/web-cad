import request from "@/utils/request"
import { History } from "@/types/History"

export function getHistoryList(projectId: number) {
  return request.get<History[]>("/mytest/getProjectHistory?projectId=1")
}

export function deleteProjectHistory(data: any) {
  return request.post("/mytest/deleteProjectHistory", data)
}
