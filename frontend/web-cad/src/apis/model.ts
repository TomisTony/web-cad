import request from "@/utils/request"

export function getModel(operationId: number) {
  return request.get("/cad/getOperationModel?operationId=" + operationId)
}

export function fillet(data: any) {
  return request.post("/cad/operation/fillet", data)
}

export function getUploadFileUrl(projectId: number) {
  return (
    request.baseConfig.baseURL + "/cad/operation/uploadFile/" + projectId
  )
}

export function getDownloadUrl(lastOperationId: number, fileFormat: string) {
  return (
    request.baseConfig.baseURL +
    "/cad/downloadFile?lastOperationId=" +
    lastOperationId +
    "&fileFormat=" +
    fileFormat
  )
}

export function rollback(data: any){
  return request.post("/cad/operation/rollback", data)
}
