import React, { useState, useEffect } from "react"
import { Button, Table, Modal, message, Form } from "antd"
import type { TableProps } from "antd"
import { useNavigate, useLocation } from "react-router-dom"
import apis from "@/apis"
import { getTimeString } from "@/utils/time"
import NewProjectForm from "./components/NewProjectForm"
import UpdateProjectForm from "./components/UpdateProjectForm"
import { ProjectInfo } from "@/types/User"
import { getUserId, getUserName } from "@/utils/localStorage"

interface DataType extends ProjectInfo {
  key: string
}

function Project() {
  const navigate = useNavigate()
  const location = useLocation()
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false)
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)
  const [updateProjectModalOpen, setUpdateProjectModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(-1) // 用于指示对哪个 project 进行操作
  const [tableData, setTableData] = useState([] as DataType[])

  const fetchAndSetProjectList = () => {
    // fetch data
    const userId = getUserId()
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
    const userId = getUserId()
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

  const username = getUserName()

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
            onClick={() => {
              setUpdateProjectModalOpen(true)
              setSelectedProjectId(record.id)
            }}
            disabled={username !== record.owner}
          >
            Edit
          </Button>
          <Button
            danger
            disabled={username !== record.owner}
            onClick={() => {
              setDeleteProjectModalOpen(true)
              setSelectedProjectId(record.id)
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
      <Button type="primary" onClick={() => setNewProjectModalOpen(true)}>
        New Project
      </Button>
      <Table className="mt-2" columns={columns} dataSource={tableData} />
      <Modal
        title="Delete Project"
        open={deleteProjectModalOpen}
        okButtonProps={{ danger: true }}
        onOk={() => {
          deleteProject(selectedProjectId)
          setDeleteProjectModalOpen(false)
        }}
        onCancel={() => setDeleteProjectModalOpen(false)}
      >
        <p>
          Are you sure to <span className="font-bold text-red-600">DELETE</span>{" "}
          project{" "}
          <span className="font-bold">
            {
              (
                tableData.find(
                  (item: any) => item.id === selectedProjectId,
                ) as any
              )?.name
            }
          </span>{" "}
          ?
        </p>
      </Modal>
      <Modal
        title="New Project"
        open={newProjectModalOpen}
        footer={null}
        closable={false}
      >
        <NewProjectForm
          onFinish={() => {
            setNewProjectModalOpen(false)
            fetchAndSetProjectList()
          }}
          onCancle={() => setNewProjectModalOpen(false)}
        />
      </Modal>
      <Modal
        title="Edit Project"
        open={updateProjectModalOpen}
        footer={null}
        closable={false}
      >
        <UpdateProjectForm
          projectData={
            tableData.find(
              (item: any) => item.id === selectedProjectId,
            ) as ProjectInfo
          }
          onFinish={() => {
            setUpdateProjectModalOpen(false)
            fetchAndSetProjectList()
          }}
          onCancle={() => setUpdateProjectModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default Project
