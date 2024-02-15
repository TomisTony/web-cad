export const getUserData = () => {
  return JSON.parse(localStorage.getItem("userData") || "{}")
}

export const getUserId = () => {
  return getUserData()?.userId || 0
}

export const getToken = () => {
  return getUserData()?.token || ""
}

export const getUserName = () => {
  return getUserData()?.username || "User"
}
