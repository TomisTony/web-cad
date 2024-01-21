import request from "@/utils/request"

// export function getModel() {
//   return request.get("/mytest/loadModel")
// }

export function fillet(lastOperationId: string) {
  return request.get("/mytest/fillet?lastOperationId=" + lastOperationId)
}

export function uploadFile() {
  return request.baseConfig.baseURL + "/mytest/uploadFile"
}

export function downloadFile() {
  return request.baseConfig.baseURL + "/mytest/downloadFile"
}
