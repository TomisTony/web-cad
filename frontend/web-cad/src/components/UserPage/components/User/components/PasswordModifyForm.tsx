import React from "react"
import { Modal, Form, Input } from "antd"
import apis from "@/apis"
import { getUserId } from "@/utils/localStorage"

interface PasswordModifyFormProps {
  open: boolean
  onOk: (success: boolean) => void
  onCancel: () => void
}

const PasswordModifyForm = ({
  open,
  onOk,
  onCancel,
}: PasswordModifyFormProps) => {
  const [form] = Form.useForm()
  const userId = getUserId()
  return (
    <Modal
      open={open}
      title="Modify Password"
      okText="Confirm"
      cancelText="Cancel"
      closeIcon={null}
      okButtonProps={{ danger: true }}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
            const res = await apis.updateUserPassword({
              oldPassword: values.oldPassword,
              newPassword: values.newPassword,
              userId: userId,
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
      <Form form={form} layout="vertical" name="passwordModifyForm">
        <Form.Item
          name="oldPassword"
          label="Old Password"
          rules={[{ required: true, message: "Please input old password" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            {
              required: true,
              message: "New Password no less than 6 bytes",
              min: 6,
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          rules={[
            { required: true, message: "Please confirm new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve()
                }
                return Promise.reject(
                  new Error("The two passwords do not match"),
                )
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PasswordModifyForm
