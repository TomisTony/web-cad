import React from "react"
import { Avatar, Button } from "antd"
import { UserOutlined } from "@ant-design/icons"

const logout = () => {
  localStorage.removeItem("userData")
  // 跳转到登录页
  
}

const Header = () => {
  const userData = localStorage.getItem("userData") || "{}"
  const name = JSON.parse(userData)?.name
  return (
    <div className="flex justify-between bg-blue-200 border-gray-100 border-2">
      <div className="ml-10 flex items-center text-xl font-bold">
        物联网设备管理平台
      </div>
      <div className="flex items-center h-full px-4 py-2 justify-end ">
        <div className="flex items-center">
          <Avatar size="large" icon={<UserOutlined />} />
          <span className="ml-4">{name ?? "UNAUTH"}</span>
        </div>
        <Button className="ml-8" danger onClick={() => logout()}>
          退出
        </Button>
      </div>
    </div>
  )
}

export default Header
