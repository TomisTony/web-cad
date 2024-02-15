export const getUserData = () => {
  return JSON.parse(localStorage.getItem("userData") || "{}")
}

export const getUserId = () => {
  return parseInt(getUserData()?.id || "0")
}

export const getToken = () => {
  return getUserData()?.token || ""
}

export const getUserName = () => {
  return getUserData()?.name || "User"
}
