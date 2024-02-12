import React from "react"
import { Outlet } from "react-router-dom"
import Header from "./components/Header"

const UserPage: React.FC = () => {
  return (
    <div className="flex flex-col h-[100%]">
      <Header />
      <SideMenu>
        <Outlet />
      </SideMenu>
    </div>
  )
}

export default UserPage
