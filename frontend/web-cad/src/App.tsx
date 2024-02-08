import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import CADPage from "@/components/CADPage"
import LoginPage from "@/components/LoginPage"
import MainPage from "./components/MainPage"

const router = createBrowserRouter([
  { path: "/cad", element: <CADPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: <MainPage /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
