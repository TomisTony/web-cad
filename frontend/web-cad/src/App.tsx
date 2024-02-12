import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import CADPage from "@/components/CADPage"
import LoginPage from "@/components/LoginPage"
import MainPage from "./components/MainPage"
import UserPage from "./components/UserPage"

const router = createBrowserRouter([
  { path: "/cad", element: <CADPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: <MainPage /> },
  { path: "/user/:userId", element: <UserPage />, children: [] },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
