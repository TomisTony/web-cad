import request from "@/utils/request"

export function getModel(operationId: number) {
  return request.get("/mytest/getOperationModel?operationId=" + operationId)
}

export function fillet(data: any) {
  return request.post("/mytest/operation/fillet", data)
}

export function getUploadFileUrl(projectId: number) {
  return (
    request.baseConfig.baseURL + "/mytest/operation/uploadFile/" + projectId
  )
}

export function getDownloadUrl(lastOperationId: number, fileFormat: string) {
  return (
    request.baseConfig.baseURL +
    "/mytest/downloadFile?lastOperationId=" +
    lastOperationId +
    "&fileFormat=" +
    fileFormat
  )
}
