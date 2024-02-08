import React from "react"
import { Link } from "react-router-dom"

function MainPage() {
  return (
    <div className="w-[100vw] h-[100vh] flex flex-col justify-center items-center bg-slate-200">
      <div
        className={
          "p-4 flex flex-col justify-center items-center " +
          "border-4 border-dotted border-black"
        }
      >
        <h1 className="text-8xl">BrCAD</h1>
        <Link className="text-xl" to="/login">
          Login
        </Link>
      </div>
    </div>
  )
}

export default MainPage
