import React, { useState, useEffect } from "react"
import { Button, Table, Modal, message } from "antd"
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
  const [open, setOpen] = useState(false)
  const [deleteProjectId, setDeleteProjectId] = useState(-1) // 用于删除项目时的提示
  const [tableData, setTableData] = useState([])

  const fetchAndSetProjectList = () => {
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
  }

  const deleteProject = (id: number) => {
    // fetch data
    const userData = JSON.parse(localStorage.getItem("userData") ?? "{}")
    const userId = parseInt(userData?.id ?? "1")
    apis.deleteProject(userId, id).then((res) => {
      if (res?.success) {
        fetchAndSetProjectList()
        message.success("Delete Success")
      } else {
        message.error(res?.message)
      }
    })
  }

  useEffect(() => {
    // fetch data
    fetchAndSetProjectList()
  }, [])

  const userData = JSON.parse(localStorage.getItem("userData") ?? "{}")
  const username = userData?.name ?? ""

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
          <Button
            onClick={() => navigate(location.pathname + "/edit")}
            disabled={username !== record.owner}
          >
            Edit
          </Button>
          <Button
            danger
            disabled={username !== record.owner}
            onClick={() => {
              setOpen(true)
              setDeleteProjectId(record.id)
            }}
          >
            Delete
          </Button>
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
        New Project
      </Button>
      <Table className="mt-2" columns={columns} dataSource={tableData} />
      <Modal
        title="Delete Project"
        open={open}
        okButtonProps={{ danger: true }}
        onOk={() => {
          deleteProject(deleteProjectId)
          setOpen(false)
        }}
        onCancel={() => setOpen(false)}
      >
        <p>
          Are you sure to <span className="font-bold text-red-600">DELETE</span>{" "}
          project{" "}
          <span className="font-bold">
            {
              (
                tableData.find(
                  (item: any) => item.id === deleteProjectId,
                ) as any
              )?.name
            }
          </span>{" "}
          ?
        </p>
      </Modal>
    </div>
  )
}

export default Project
