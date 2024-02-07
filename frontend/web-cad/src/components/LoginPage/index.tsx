import apis from "@/apis"
import React, { useRef } from "react"
import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Form, Input, Card, message } from "antd"

const LoginPage: React.FC = () => {
  const [registerForm] = Form.useForm()
  const [loginForm] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const loginCardRef = useRef<HTMLDivElement>(null)
  const registerCardRef = useRef<HTMLDivElement>(null)

  const displayRegisterCard = () => {
    if (loginCardRef.current)
      loginCardRef.current.style.transform = "rotateY(180deg)"
    if (registerCardRef.current)
      registerCardRef.current.style.transform = "rotateY(0deg)"
    loginForm.resetFields()
  }

  const displayLoginCard = () => {
    if (loginCardRef.current)
      loginCardRef.current.style.transform = "rotateY(0deg)"
    if (registerCardRef.current)
      registerCardRef.current.style.transform = "rotateY(-180deg)"
    registerForm.resetFields()
  }

  const onLoginFinish = async (values: any) => {
    apis
      .login({
        username: values.username,
        password: values.password,
      })
      .then((res) => {
        if (res?.success) {
          messageApi.success(res?.message)
        } else {
          messageApi.error(res?.message)
        }
      })
  }

  const onRegisterFinish = async (values: any) => {
    apis
      .register({
        username: values.username,
        password: values.password,
        email: values.email,
      })
      .then((res) => {
        if (res?.success) {
          messageApi.success(res?.message)
          displayLoginCard()
        } else {
          messageApi.error(res?.message)
        }
      })
  }

  return (
    <div className="flex h-[100vh] w-[100vw] ">
      {contextHolder}
      <div className="flex-grow bg-gradient-to-r from-slate-700 via-blue-400 to-slate-200"></div>
      <div
        className={
          "w-[400px] bg-slate-200 flex flex-col " +
          "border-2 border-black border-opacity-10 border-t-0 border-b-0"
        }
      >
        <div className="flex pt-[5%] justify-center h-[10%] items-center font-bold text-6xl">
          BrCAD
        </div>
        <div className="flex-grow relative">
          <div
            className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[400px]"
            style={{ perspective: "1500px" }}
          >
            <Card
              className={
                "w-[350px] h-[350px] absolute top-0 left-0 shadow-lg cursor-auto select-none " +
                "backface-hidden transform transition-all duration-500"
              }
              title="Login"
              hoverable
              headStyle={{
                fontSize: "16px",
              }}
              ref={loginCardRef}
            >
              <Form form={loginForm} name="login" onFinish={onLoginFinish}>
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
              <div className="flex justify-center items-center">
                <span>don't have account?</span>
                <Button
                  className="p-0 pl-2"
                  type="link"
                  onClick={displayRegisterCard}
                >
                  Go register
                </Button>
              </div>
            </Card>

            <Card
              className={
                "w-[350px] h-[400px] shadow-lg cursor-auto select-none " +
                "absolute top-0 left-0 " +
                "backface-hidden transform rotate-flip transition-all duration-500"
              }
              title="Register"
              hoverable
              headStyle={{
                fontSize: "16px",
              }}
              ref={registerCardRef}
            >
              <Form
                name="register"
                onFinish={onRegisterFinish}
                form={registerForm}
              >
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
              <div className="flex justify-center items-center">
                <span>have an account?</span>
                <Button
                  className="p-0 pl-2"
                  type="link"
                  onClick={displayLoginCard}
                >
                  Go Login
                </Button>
              </div>
            </Card>
          </div>
        </div>
        <div className="flex flex-col justify-center h-[10%] items-center text-sm text-gray-400">
          <span>Copyright © 2023-2024 BrCAD</span>
          <span>Br All Rights Reserved.</span>
        </div>
      </div>
      <div className="flex-grow bg-gradient-to-l from-slate-700 via-blue-400 to-slate-200"></div>
    </div>
  )
}

export default LoginPage
