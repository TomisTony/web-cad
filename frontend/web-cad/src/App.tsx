import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import CADPage from "@/components/CADPage"
import LoginPage from "@/components/LoginPage"
import MainPage from "./components/MainPage"
import UserPage from "./components/UserPage"
import Home from "./components/UserPage/components/Home"
import User from "./components/UserPage/components/User"
import Project from "./components/UserPage/components/Project"

const router = createBrowserRouter([
  { path: "/cad/:projectId", element: <CADPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: <MainPage /> },
  {
    path: "/user/:userId",
    element: <UserPage />,
    children: [
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "project",
        element: <Project />,
      },
      {
        path: "user",
        element: <User />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
