import React from "react"
import { Modal, Form, Input } from "antd"
import { UserInfo } from "@/types/User"
import apis from "@/apis"
import { useEffect } from "react"

interface UserInfoModifyFormProps {
  open: boolean
  initialValues: UserInfo
  onOk: (success: boolean) => void
  onCancel: () => void
}

const UserInfoModifyForm = ({
  open,
  initialValues,
  onOk,
  onCancel,
}: UserInfoModifyFormProps) => {
  const [form] = Form.useForm()
  useEffect(() => {
    if (open) form.setFieldsValue(initialValues ?? {})
  }, [open])
  return (
    <Modal
      open={open}
      title="Modify User Info"
      okText="Confirm"
      cancelText="Cancel"
      closeIcon={null}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
            const res = await apis.updateUserInfo({
              ...values,
              userId: initialValues.id,
            })
            onOk(res.success)
          })
          .catch((info) => {
            console.log("Validate Failed:", info)
          })
          .finally(() => {
            form.resetFields()
          })
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="userInfoModifyForm"
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label="Username"
          rules={[
            {
              required: true,
              message: "Username no less than 6 bytes",
              min: 6,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input email" },
            {
              pattern:
                /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
              message: "Please input correct email address",
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserInfoModifyForm
