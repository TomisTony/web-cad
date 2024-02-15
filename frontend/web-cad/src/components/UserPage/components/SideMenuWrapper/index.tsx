import React from "react"
import { HomeOutlined, UserOutlined, ProjectOutlined } from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Menu } from "antd"
import { useLocation, useNavigate } from "react-router-dom"
import { getUserId } from "@/utils/localStorage"

type MenuItem = Required<MenuProps>["items"][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  url?: string | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group",
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
    url,
  } as MenuItem
}

const items: MenuProps["items"] = [
  getItem("Home", "home", "home", <HomeOutlined />),
  getItem("User", "user", "user", <UserOutlined />),
  getItem("Project", "project", "project", <ProjectOutlined />),
]

type SideMenuProps = {
  children: React.ReactNode
  containerClassName?: string
}

const changeRoute = (origin: string, target: string) => {
  // 原先的路由形式都是类似 /user/:userId/home/... 这样的形式
  // 这里我们要使用正则表达式换成 /user/:userId/{target} 这样的形式
  const userId = getUserId()
  return origin.replace(
    new RegExp(`/user/${userId}/[^/]+`),
    `/user/${userId}/${target}`,
  )
}

function SideMenuWrapper(props: SideMenuProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e)
    // originPath: /user/:userId/...
    const originPath = location.pathname
    navigate(changeRoute(originPath, e.key as string))
  }
  const getKeyFromRouterPath = () => {
    const key = location.pathname.match(/\/user\/[^/]+\/([^/]+)/)?.[1]
    return key ?? "home"
  }

  return (
    <div className="flex-grow flex">
      <div
        className={
          "w-[15%] min-w-[200px] h-full flex flex-col justify-between" +
          " border-r-2 border-t-0 border-b-0 border-l-0 border-solid border-gray-200"
        }
      >
        <Menu
          onClick={onClick}
          selectedKeys={[getKeyFromRouterPath()]}
          defaultSelectedKeys={["home"]}
          mode="inline"
          items={items}
        />
        <div className="text-xs flex px-8 py-4 font-thin italic text-gray-400">
          Copyright © 2023-2024 <br />
          BrCAD <br />
          Br All Rights Reserved. <br />
        </div>
      </div>
      <div className={props.containerClassName}>{props.children}</div>
    </div>
  )
}

export default SideMenuWrapper
