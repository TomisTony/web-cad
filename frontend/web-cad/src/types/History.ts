import { OperationSetting, OperationSubmitValues } from "./Operation"

export interface History {
  operationId: number
  time: number
  operator: string
  operationName: string
  operationSetting?: OperationSetting
  operationSubmitValues?: OperationSubmitValues
}
