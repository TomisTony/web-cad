import request from "@/utils/request"

// export function getModel() {
//   return request.get("/mytest/loadModel")
// }

export function fillet(data: any) {
  return request.post("/mytest/operation/fillet", data)
}

export function getUploadFileUrl(projectId: number) {
  return (
    request.baseConfig.baseURL + "/mytest/operation/uploadFile/" + projectId
  )
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
