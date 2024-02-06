import apis from "@/apis"
import React from "react"
import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Form, Input, Card, message } from "antd"

const LoginPage: React.FC = () => {
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()

  const onLoginFinish = async (values: any) => {
    // const res = await signIn('login', {
    //   redirect: false,
    //   username: values.username,
    //   password: values.password,
    //   callbackUrl,
    // })
    // if (!res?.error) {
    //   router.push(callbackUrl)
    // } else {
    //   messageApi.error('用户名或密码错误')
    // }
  }

  const onRegisterFinish = async (values: any) => {
    // const res = await apis.register(
    //   values.email,
    //   values.username,
    //   values.password,
    // )
    // if (res?.success) {
    //   messageApi.success('注册成功')
    //   form.resetFields()
    // } else {
    //   messageApi.error('注册失败，' + res.error)
    // }
  }

  return (
    <div className="flex flex-col h-[100vh] w-[100vw] bg-gradient-to-b from-slate-400 via-blue-200 to-slate-100">
      {contextHolder}
      <div className="flex justify-center h-[10%] items-center font-bold text-4xl border-b-2 border-t-0 border-x-0 border-solid border-black">
        BrCAD
      </div>
      <div className="flex-grow flex justify-center items-center ">
        <Card
          className="w-[25%] h-[60%] shadow-lg"
          title="Login"
          hoverable
          headStyle={{
            fontSize: "16px",
          }}
        >
          <Form name="login" onFinish={onLoginFinish}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Username"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item className="mt-8">
              <Button type="primary" htmlType="submit" className="w-full">
                Login
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <span className="border-solid border border-gray-400 h-[70%] mx-8"></span>

        <Card
          className="w-[25%] h-[60%] shadow-lg"
          title="Register"
          hoverable
          headStyle={{
            fontSize: "16px",
          }}
        >
          <Form name="register" onFinish={onRegisterFinish} form={form}>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter correct email address",
                  type: "email",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Email"
              />
            </Form.Item>
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Username must no less than 6 bytes",
                  min: 6,
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Username"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Password must no less than 6 bytes",
                  min: 6,
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item className="mt-8">
              <Button type="primary" htmlType="submit" className="w-full">
                Register
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      <div className="flex flex-col justify-center h-[10%] items-center text-sm text-gray-400">
        <span>Copyright © 2023-2024 BrCAD</span>
        <span>Br All Rights Reserved.</span>
      </div>
    </div>
  )
}

export default LoginPage
