import request from "@/utils/request"

export function login(data: any) {
  return request.post("/user/login", data)
}

export function register(data: any) {
  return request.post("/user/register", data)
}

export function getUserInfo(userId: number) {
  return request.get("/user/getUserInfo?userId=" + userId)
}

export function updateUserInfo(data: any) {
  return request.post("/user/updateUserInfo", data)
}

export function updateUserPassword(data: any) {
  return request.post("/user/updateUserPassword", data)
}

export function getProjectList(userId: number) {
  return request.get("/user/getProjectList?userId=" + userId)
}

export function deleteProject(userId: number, projectId: number) {
  return request.get(
    "/user/deleteProject?userId=" + userId + "&projectId=" + projectId,
  )
}

export function getAllUser() {
  return request.get("/user/getAllUser")
}

export function createProject(data: any) {
  return request.post("/user/createProject", data)
}

export function updateProject(data: any) {
  return request.post("/user/updateProject", data)
}
