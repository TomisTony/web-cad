import React, { useEffect, useState } from "react"
import { Form, Button, Input, Select, message } from "antd"
import apis from "@/apis"
import { getUserId } from "@/utils/localStorage"

interface NewProjectFormProps {
  onFinish: () => void
  onCancle: () => void
}

function NewProjectForm(props: NewProjectFormProps) {
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
  const onFinish = (values: any) => {
    form.validateFields().then(() => {
      console.log(values)
      apis.createProject({ userId, ...values }).then(() => {
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
          Create
        </Button>
        <Button
          className="ml-4"
          htmlType="button"
          onClick={() => props.onCancle()}
        >
          Cancel
        </Button>
      </Form.Item>
    </Form>
  )
}

export default NewProjectForm
