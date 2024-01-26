import { OperationSetting, OperationSubmitValues } from "./Operation"

export interface History {
  operationId: number
  operationSetting?: OperationSetting
  operationSubmitValues?: OperationSubmitValues
}
