import loadDiff from "@/assets/operations/loadDiff.png"
import loadModel from "@/assets/operations/loadModel.png"

import { loadModelAsync, loadDiffAsync } from "@/features/model/modelSlice"

interface Operation {
  label: string
  img: string
  action: () => any
}

const operationList: Operation[] = [
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
  {
    label: "loadModel",
    img: loadModel,
    action: loadModelAsync,
  },
  {
    label: "loadDiff",
    img: loadDiff,
    action: loadDiffAsync,
  },
]

export default operationList
