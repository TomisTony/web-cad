import Line from "@/shape/Line"
import Model from "@/shape/Model"

export type ExtendedShape = (Line | Model) & {
  originHex: number
}
