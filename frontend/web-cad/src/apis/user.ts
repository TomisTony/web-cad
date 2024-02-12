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
