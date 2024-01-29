import request from "@/utils/request"
import { History } from "@/types/History"

export function getHistory() {
  return request.get<History[]>("/mytest/getProjectHistory?projectId=1")
}
