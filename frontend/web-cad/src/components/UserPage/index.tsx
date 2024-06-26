import React from "react"
import { Outlet } from "react-router-dom"
import Header from "./components/Header"
import SideMenuWrapper from "./components/SideMenuWrapper"

const UserPage: React.FC = () => {
  return (
    <div className="flex flex-col h-[100vh]">
      <Header />
      <SideMenuWrapper containerClassName="flex-grow p-4">
        <Outlet />
      </SideMenuWrapper>
    </div>
  )
}

export default UserPage
