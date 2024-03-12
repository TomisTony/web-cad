import React, { useEffect, useState } from "react"
import { Input, Select, Checkbox, Form, Button } from "antd"

import { useAppSelector, useAppDispatch } from "@/app/hooks"
import store from "@/app/store"
import {
  setOperationPanel,
  setGlobalMessage,
} from "@/store/globalStatus/globalStatusAction"

import { OperationSetting, OperationSubmitValues } from "@/types/Operation"

import TopoSelect from "./components/TopoSelect"

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
  const dispatch = useAppDispatch()
  // 获取已经选择的对象
  const __choosedIdList = useAppSelector((state) => state.model.choosedIdList)
  const __choosedTypeList = useAppSelector(
    (state) => state.model.choosedTypeList,
  )
  const choosedIdList = [...__choosedIdList]
  const choosedTypeList = [...__choosedTypeList]
  // 在 choosedTypeList 中按照 typeList 的顺序找到对应的 id, 多个相同 type 的选项按照先后顺序取
  const defaultChoosedList = typeList?.map((type) => {
    const index = choosedTypeList?.indexOf(type)
    if (index === undefined || index === -1) {
      return undefined
    }
    choosedTypeList?.splice(index, 1)
    const res = choosedIdList?.[index]
    choosedIdList?.splice(index, 1)
    return res
  })
  const [choosedList, setChoosedList] = useState(defaultChoosedList)
  // 根据选中更新 choosedList
  // TODO: 需要使用 ahook
  useEffect(() => {
    const choosedIdList = [...__choosedIdList]
    const choosedTypeList = [...__choosedTypeList]
    // 在 choosedTypeList 中按照 typeList 的顺序找到对应的 id, 多个相同 type 的选项按照先后顺序取
    const defaultChoosedList = typeList?.map((type) => {
      const index = choosedTypeList?.indexOf(type)
      if (index === undefined || index === -1) {
        return undefined
      }
      choosedTypeList?.splice(index, 1)
      const res = choosedIdList?.[index]
      choosedIdList?.splice(index, 1)
      return res
    })
    setChoosedList(defaultChoosedList)
  }, [__choosedIdList, __choosedTypeList])

  const onFinish = (values: any) => {
    const submitValues: OperationSubmitValues = {
      choosedIdList: choosedList ?? [],
      choosedTypeList: typeList ?? [],
      relatedSolidIdList: (choosedList ?? []).map((id: string) => {
        const solidId = store.getState().model.idSolidIdMap[id]
        return solidId
      }),
      props: values,
    }
    // 检查 choosedIdList 是否对应 typeList
    let check = true
    ;(submitValues.choosedTypeList as string[]).forEach(
      (_: string, index: number) => {
        if (!(submitValues.choosedIdList as string[])[index]) {
          check = false
        }
      },
    )
    if (!check) {
      dispatch(
        setGlobalMessage({
          type: "error",
          content: "Please choose Topo!",
        }),
      )
      return
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
    <div className="bg-gray-400 bg-opacity-50 w-[20%] p-4 h-max select-none pointer-events-auto ">
      <Form
        className={"flex flex-col " + className}
        form={form}
        onFinish={onFinish}
        initialValues={initialValues}
      >
        <div className="text-2xl font-bold border-0 border-b-2 border-solid border-black mb-2">
          {operationName}
        </div>
        <div className="flex flex-col max-h-[350px] overflow-auto">
          <div className="text-lg font-bold">Chosen Topo</div>
          <div className="text-base">
            {typeList && (
              <TopoSelect
                typeList={typeList}
                chooseLabelList={chooseLabelList as string[]}
                choosedList={choosedList as (string | undefined)[]}
                setChoosedList={setChoosedList}
              />
            )}
          </div>
          <div className="text-lg font-bold">Props</div>
          <div className="text-base">
            {props?.map((prop, index) => (
              <div key={index} className="flex space-y-2 items-center">
                <div className="text-base mr-2 min-w-[20%]">
                  {prop.label + ":"}
                </div>
                {prop.type === "input" && (
                  <Form.Item
                    className="m-0"
                    name={prop.label}
                    rules={[{ required: true, message: "value require!" }]}
                  >
                    <Input className="w-full" placeholder={prop.info} />
                  </Form.Item>
                )}
                {prop.type === "select" && (
                  <Form.Item
                    className="m-0"
                    name={prop.label}
                    rules={[{ required: true, message: "value require!" }]}
                  >
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
                    rules={[{ required: true, message: "value require!" }]}
                  >
                    <Checkbox />
                  </Form.Item>
                )}
              </div>
            ))}
          </div>
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
    </div>
  )
}

export default OperationPanel
