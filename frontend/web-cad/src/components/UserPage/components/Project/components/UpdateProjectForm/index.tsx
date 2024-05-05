import React, { useEffect, useState } from "react"
import { Form, Button, Input, Select, message } from "antd"
import apis from "@/apis"
import { ProjectInfo } from "@/types/User"
import { getUserId } from "@/utils/localStorage"

interface UpdateProjectFormProps {
  onFinish: () => void
  onCancle: () => void
  projectData: ProjectInfo
}

function UpdateProjectForm(props: UpdateProjectFormProps) {
  const [form] = Form.useForm()
  const [options, setOptions] = useState([])
  const userId = getUserId()
  const filterOption = (
    input: string,
    option?: { label: string; value: string },
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
  useEffect(() => {
    apis.getAllUser().then((res) => {
      setOptions(
        res
          .map((item: any) => {
            return { label: item.name, value: item.id }
          })
          .filter(
            (option: { label: string; value: string }) =>
              option.value != userId.toString(),
          ),
      )
    })
  }, [])
  useEffect(() => {
    form.setFieldsValue(props.projectData)
  }, [props.projectData])
  const onFinish = (values: any) => {
    form.validateFields().then(() => {
      console.log(values)
      apis
        .updateProject({ userId, projectId: props.projectData?.id, ...values })
        .then(() => {
          message.success("Create project success.")
          props.onFinish()
        })
    })
  }

  return (
    <Form
      form={form}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      onFinish={onFinish}
      initialValues={props.projectData}
    >
      <Form.Item
        label="Project Name"
        name="name"
        rules={[{ required: true, message: "Please input project name!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[
          { required: true, message: "Please input project description!" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Editors" name="editorIds">
        <Select
          mode="multiple"
          showSearch
          placeholder="Choose editors. Search enable."
          filterOption={filterOption}
          options={options}
        />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Update
        </Button>
        <Button
          className="ml-4"
          htmlType="button"
          onClick={() => {
            props.onCancle()
          }}
        >
          Cancel
        </Button>
      </Form.Item>
    </Form>
  )
}

export default UpdateProjectForm
