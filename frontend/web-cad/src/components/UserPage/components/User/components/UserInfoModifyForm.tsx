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
    form.setFieldsValue(initialValues ?? {})
  }, [open])
  return (
    <Modal
      open={open}
      title="修改信息"
      okText="确认"
      cancelText="取消"
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
        name="form_in_modal"
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label="用户名"
          rules={[
            { required: true, message: "用户名的长度不小于6个字节", min: 6 },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: "请输入邮箱" },
            {
              pattern:
                /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
              message: "邮箱格式不正确",
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
