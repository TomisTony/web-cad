import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import CADPage from "@/components/CADPage"
import LoginPage from "@/components/LoginPage"

const router = createBrowserRouter([
  { path: "/cad", element: <CADPage /> },
  { path: "/login", element: <LoginPage /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
