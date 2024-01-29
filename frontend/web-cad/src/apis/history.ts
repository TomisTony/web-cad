import request from "@/utils/request"
import { History } from "@/types/History"

export function getHistoryList(projectId: number) {
  return request.get<History[]>("/mytest/getProjectHistory?projectId=1")
}
