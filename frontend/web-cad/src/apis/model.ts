import request from "@/utils/request"

export function getModel(operationId: number) {
  return request.get("/cad/getOperationModel?operationId=" + operationId)
}

export function fillet(data: any) {
  return request.post("/cad/operation/fillet", data)
}

export function chamfer(data: any) {
  return request.post("/cad/operation/chamfer", data)
}

export function getUploadFileUrl(
  projectId: number,
  operatorId: number,
  lastOperationId: number,
) {
  return (
    request.baseConfig.baseURL +
    "/cad/operation/uploadFile/" +
    projectId +
    "/" +
    operatorId +
    "/" +
    lastOperationId
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

export function rename(data: any) {
  return request.post("/cad/operation/rename", data)
}

export function transform(data: any) {
  return request.post("/cad/operation/transform", data)
}

export function makeBox(data: any) {
  return request.post("/cad/operation/makeBox", data)
}

export function makeCylinder(data: any) {
  return request.post("/cad/operation/makeCylinder", data)
}

export function makeCone(data: any) {
  return request.post("/cad/operation/makeCone", data)
}

export function makeSphere(data: any) {
  return request.post("/cad/operation/makeSphere", data)
}

export function makeTorus(data: any) {
  return request.post("/cad/operation/makeTorus", data)
}

export function deleteSolid(data: any) {
  return request.post("/cad/operation/deleteSolid", data)
}

export function rollback(data: any) {
  return request.post("/cad/operation/rollback", data)
}
