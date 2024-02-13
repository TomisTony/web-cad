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
      label: "Avatar",
      children: <Avatar size="large" icon={<UserOutlined />} />,
    },
    {
      key: "3",
      label: "Username",
      children: <p>{userInfo.name}</p>,
    },
    {
      key: "4",
      label: "Email",
      children: <p>{userInfo.email}</p>,
    },
    {
      key: "5",
      label: "Join Time",
      children: <p>{userInfo.joinTime}</p>,
    },
    {
      key: "6",
      label: "Last Login Time",
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
        title="User Info"
        items={items}
        column={1}
        bordered
        className="w-[50%]"
      />
      <div className="mt-10">
        <Button className="mr-12" onClick={() => setVisible(1)}>
          Modify Info
        </Button>
        <Button type="primary" danger onClick={() => setVisible(2)}>
          Modify Password
        </Button>
      </div>
      <UserInfoModifyForm
        open={visible === 1}
        initialValues={userInfo}
        onOk={(success) => {
          if (success) {
            messageApi.success("Modify user info successfully")
          } else {
            messageApi.error("Modify user info failed, please check the input")
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
            messageApi.success("Modify password successfully")
          } else {
            messageApi.error("Modify password failed, please check the input")
          }
          setVisible(0)
        }}
        onCancel={() => setVisible(0)}
      />
    </div>
  )
}

export default UserPage
