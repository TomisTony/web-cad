import React from "react"
import { Input, Select, Checkbox, Form, Button } from "antd"

import { useAppSelector } from "@/app/hooks"
import store from "@/app/store"
import { setOperationPanel } from "@/store/globalStatus/globalStatusAction"

import { OperationSetting, OperationSubmitValues } from "@/types/Operation"

interface Props {
  className?: string
  operationSetting: OperationSetting
}

function OperationPanel({ className, operationSetting }: Props) {
  const {
    operationName,
    chooseLabelList,
    chooseTypeList: typeList,
    props,
  } = operationSetting

  const [form] = Form.useForm()

  // 获取已经选择的对象
  const __choosedIdList = useAppSelector((state) => state.model.choosedIdList)
  const __choosedTypeList = useAppSelector(
    (state) => state.model.choosedTypeList,
  )
  const choosedIdList = [...__choosedIdList]
  const choosedTypeList = [...__choosedTypeList]
  // 在 choosedTypeList 中按照 typeList 的顺序找到对应的 id, 多个相同 type 的选项按照先后顺序取
  const choosedList = typeList?.map((type) => {
    const index = choosedTypeList?.indexOf(type)
    if (index === undefined || index === -1) {
      return undefined
    }
    choosedTypeList?.splice(index, 1)
    const res = choosedIdList?.[index]
    choosedIdList?.splice(index, 1)
    return res
  })

  const onFinish = (values: any) => {
    const submitValues: OperationSubmitValues = {
      choosedIdList: choosedList ?? [],
      choosedTypeList: typeList ?? [],
      props: values,
    }
    console.log(submitValues)
    operationSetting?.onSubmit?.(submitValues)
    store.dispatch(setOperationPanel(""))
  }

  const onReset = () => {
    form.resetFields()
  }

  // 初始化表单的值
  const initialValues: any = {}
  props?.forEach((prop) => {
    initialValues[prop.label] = prop.defaultValue
  })

  return (
    <Form
      className={
        "bg-gray-400 bg-opacity-50 w-[20%] h-full p-4 flex flex-col shadow-sm" +
        " select-none pointer-events-auto " +
        "rounded-lg" +
        "border-solid border border-black" +
        className
      }
      form={form}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <div className="text-2xl font-bold border-0 border-b-2 border-solid border-black">
        {operationName}
      </div>
      <div className="text-lg font-bold">Choosed Topo</div>
      <div className="text-base">
        {chooseLabelList?.map((label, i) => (
          <div
            key={i}
            className="whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {label +
              ": " +
              (choosedList?.[i] === undefined ? "None" : choosedList[i])}
          </div>
        ))}
      </div>
      <div className="text-lg font-bold">Props</div>
      <div className="text-base">
        {props?.map((prop, index) => (
          <div key={index} className="flex space-x-2 items-center">
            <div className="text-base mr-2">{prop.label + ":"}</div>
            {prop.type === "input" && (
              <Form.Item className="m-0" name={prop.label}>
                <Input className="w-full" placeholder={prop.info} />
              </Form.Item>
            )}
            {prop.type === "select" && (
              <Form.Item className="m-0" name={prop.label}>
                <Select className="w-full" placeholder={prop.info}>
                  {prop.options?.map((option, index) => (
                    <Select.Option key={index} value={option}>
                      {option}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {prop.type === "checkbox" && (
              <Form.Item
                className="m-0"
                name={prop.label}
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>
            )}
          </div>
        ))}
      </div>
      <div className="flex space-x-2 mt-8">
        <Button
          className="w-full bg-gray-400 text-black rounded-lg border-black"
          onClick={onReset}
        >
          Reset
        </Button>
        <Button
          className="w-full bg-gray-700 text-white rounded-lg border-white"
          type="primary"
          htmlType="submit"
        >
          Submit
        </Button>
      </div>
    </Form>
  )
}

export default OperationPanel
