import request from "@/utils/request"

// export function getModel() {
//   return request.get("/mytest/loadModel")
// }

export function fillet(lastOperationId: string) {
  return request.get("/mytest/fillet?lastOperationId=" + lastOperationId)
}

export function getUploadFileUrl() {
  return request.baseConfig.baseURL + "/mytest/uploadFile"
}

export function getDownloadUrl(lastOperationId: string, fileFormat: string) {
  return (
    request.baseConfig.baseURL +
    "/mytest/downloadFile?lastOperationId=" +
    lastOperationId +
    "&fileFormat=" +
    fileFormat
  )
}
