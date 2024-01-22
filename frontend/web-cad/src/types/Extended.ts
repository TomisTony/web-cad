import Line from "@/shape/line"
import Model from "@/shape/model"

export type ExtendedShape = (Line | Model) & {
  originHex: number
}
