import request from "@/utils/request"

export function getModel() {
  return request.get("/mytest/loadModel")
}

export function getDiff() {
  return request.get("/mytest/loadDiff")
}
