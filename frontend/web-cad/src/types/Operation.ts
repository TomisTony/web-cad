export interface OperationSetting {
  operationName: string // 操作的名称
  chooseCount: number // 操作可以选择的对象的数量
  chooseLabelList?: string[] // 操作可以选择的对象的名称
  chooseTypeList?: string[] // 操作可以选择的对象的类型, "edge", "face"
  props?: OperationProps[] // 操作的参数
  onSubmit?: (values: any) => void // 操作的提交函数
}

export interface OperationProps {
  type: string // 参数的呈现类型, "input", "select", "checkbox"
  label: string // 参数的名称
  info?: string // 参数的描述
  options?: string[] // 参数的选项, 用于 select, radio
  defaultValue?: any // 参数的值, 用于初始化
}

export interface OperationSubmitValues {
  choosedIdList?: (string | undefined)[]
  choosedTypeList?: (string | undefined)[]
  props: any
}
