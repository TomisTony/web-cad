import React, { useState, useEffect } from "react"
import { Button, Table } from "antd"
import type { TableProps } from "antd"
import { useNavigate, useLocation } from "react-router-dom"
import apis from "@/apis"
import { getTimeString } from "@/utils/time"

interface DataType {
  key: string
  id: number
  name: string
  description: string
  createTime: number
  owner: string
}

function Project() {
  const navigate = useNavigate()
  const location = useLocation()
  const [tableData, setTableData] = useState([])
  useEffect(() => {
    // fetch data
    const userData = JSON.parse(localStorage.getItem("userData") ?? "{}")
    const userId = parseInt(userData?.id ?? "1")
    apis.getProjectList(userId).then((res) => {
      // 加上 key, 不然 react 会报错
      setTableData(
        res.map((item: DataType) => {
          return { ...item, key: item.id }
        }),
      )
    })
  }, [])

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Id",
      dataIndex: "id",
      width: 75,
    },
    {
      title: "Name",
      dataIndex: "name",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      ellipsis: true,
      width: 400,
    },
    {
      title: "Create Time",
      dataIndex: "createTime",
      width: 200,
      render: (text: any) => getTimeString(text),
    },
    {
      title: "Owner",
      dataIndex: "owner",
      width: 150,
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 250,
      render: (_, record: DataType) => (
        <span className="flex justify-evenly">
          <Button
            type="primary"
            onClick={() => window.open(`/cad/${record.id}`)}
          >
            Enter
          </Button>
          <Button onClick={() => navigate(location.pathname + "/edit")}>
            Edit
          </Button>
          <Button danger>Delete</Button>
        </span>
      ),
    },
  ]

  return (
    <div>
      <Button
        type="primary"
        onClick={() => navigate(location.pathname + "/create")}
      >
        Create Project
      </Button>
      <Table className="mt-2" columns={columns} dataSource={tableData} />
    </div>
  )
}

export default Project
