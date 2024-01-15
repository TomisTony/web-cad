import request from "@/utils/request"

export function getModel() {
  return request.get("/mytest/loadModel")
}

export function getDiff(lastOperationId: string) {
  return request.get("/mytest/loadDiff?lastOperationId=" + lastOperationId)
}
