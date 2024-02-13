import React from "react"
import { Button, Descriptions, DescriptionsProps, Avatar, message } from "antd"
import { UserOutlined } from "@ant-design/icons"
import { UserInfo } from "@/types/User"
import { useEffect, useMemo, useState } from "react"
import apis from "@/apis"
import PasswordModifyForm from "./components/PasswordModifyForm"
import UserInfoModifyForm from "./components/UserInfoModifyForm"

const getItems = (userInfo: UserInfo) => {
  return [
    {
      key: "1",
      label: "ID",
      children: <p>{userInfo.id}</p>,
    },
    {
      key: "2",
      label: "头像",
      children: <Avatar size="large" icon={<UserOutlined />} />,
    },
    {
      key: "3",
      label: "用户名",
      children: <p>{userInfo.name}</p>,
    },
    {
      key: "4",
      label: "邮箱",
      children: <p>{userInfo.email}</p>,
    },
    {
      key: "5",
      label: "注册时间",
      children: <p>{userInfo.joinTime}</p>,
    },
    {
      key: "6",
      label: "最后登录时间",
      children: <p>{userInfo.lastLoginTime}</p>,
    },
  ] as DescriptionsProps["items"]
}

const UserPage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo)
  const [visible, setVisible] = useState(0) // 0: 不显示, 1: 修改信息, 2: 修改密码
  const userData = JSON.parse(localStorage.getItem("userData") ?? "{}")
  const userId = parseInt(userData?.id ?? "1")

  useEffect(() => {
    apis.getUserInfo(userId).then((res: UserInfo) => {
      setUserInfo(res)
    })
  }, [])

  const [messageApi, contextHolder] = message.useMessage()

  const items = useMemo(() => getItems(userInfo), [userInfo])

  return (
    <div className="flex flex-col justify-center items-center">
      {contextHolder}
      <Descriptions
        title="用户信息"
        items={items}
        column={1}
        bordered
        className="w-[50%]"
      />
      <div className="mt-10">
        <Button className="mr-12" onClick={() => setVisible(1)}>
          修改信息
        </Button>
        <Button type="primary" danger onClick={() => setVisible(2)}>
          修改密码
        </Button>
      </div>
      <UserInfoModifyForm
        open={visible === 1}
        initialValues={userInfo}
        onOk={(success) => {
          if (success) {
            messageApi.success("修改用户信息成功")
          } else {
            messageApi.error("修改用户信息失败，请联系系统管理员")
          }
          apis.getUserInfo(userId).then((res: UserInfo) => {
            console.log(res)
            setUserInfo(res)
          })
          setVisible(0)
        }}
        onCancel={() => setVisible(0)}
      />
      <PasswordModifyForm
        open={visible === 2}
        onOk={(success) => {
          if (success) {
            messageApi.success("修改密码成功")
          } else {
            messageApi.error("修改密码失败，请检查旧密码是否输入正确")
          }
          setVisible(0)
        }}
        onCancel={() => setVisible(0)}
      />
    </div>
  )
}

export default UserPage
