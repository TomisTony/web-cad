export interface UserInfo {
  id: number
  name: string
  email: string
  joinTime: string
  lastLoginTime: string
}

export interface ProjectInfo {
  id: number
  name: string
  description: string
  createTime: number
  owner: string
  editorIds: number[]
}
