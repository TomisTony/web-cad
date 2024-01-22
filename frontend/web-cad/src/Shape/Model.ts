import * as THREE from "three"
import { FaceMetaData } from "@/types/Metadata"

import store from "@/app/store"

export default class Model extends THREE.Mesh {
  public faceColors: number[]
  public globalFaceMetadata: Record<string, FaceMetaData>
  public faceIds: string[]

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    colors: number[],
    globalFaceMetadata: Record<string, FaceMetaData>,
    faceIds: string[],
  ) {
    super(geometry, material)

    this.faceColors = colors
    this.globalFaceMetadata = globalFaceMetadata
    this.faceIds = faceIds

    this.castShadow = true
    this.name = "Model"
  }

  public highlightAtIndex(id: string) {
    if (!this.globalFaceMetadata[id]) return

    // 如果已经被选中，就不再高亮
    const choosedIdList = store.getState().model.choosedIdList
    const hasChoosed = choosedIdList.includes(id)
    if (hasChoosed) return

    const startIndex = this.globalFaceMetadata[id].colorIndexStart
    const endIndex = this.globalFaceMetadata[id].colorIndexEnd
    for (let i = startIndex + 2; i < endIndex; i += 3) {
      this.faceColors[i] = 0
    }

    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.faceColors, 3),
    )
    this.geometry.attributes.color.needsUpdate = true
  }

  public clearHighlights() {
    // 已经被选中的不变，其余置为 0
    const choosedIdList = store.getState().model.choosedIdList
    const startIndexList: number[] = []
    const endIndexList: number[] = []
    choosedIdList.forEach((id) => {
      if (!this.globalFaceMetadata[id]) return
      startIndexList.push(this.globalFaceMetadata[id].colorIndexStart)
      endIndexList.push(this.globalFaceMetadata[id].colorIndexEnd)
    })
    // 一次遍历，如果遇到位于 startIndex 的 i，则直接跳过到 endIndex
    let i = 0
    while (i < this.faceColors.length) {
      if (startIndexList.includes(i)) {
        i = endIndexList[startIndexList.indexOf(i)] + 1
        continue
      }
      this.faceColors[i] = 1
      i++
    }
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.faceColors, 3),
    )
    this.geometry.attributes.color.needsUpdate = true
  }

  public toggleChoosedHighlightAtIndex(id: string) {
    if (!this.globalFaceMetadata[id]) return

    const choosedIdList = store.getState().model.choosedIdList
    const hasChoosed = choosedIdList.includes(id)

    const startIndex = this.globalFaceMetadata[id].colorIndexStart
    const endIndex = this.globalFaceMetadata[id].colorIndexEnd
    for (let i = startIndex; i < endIndex; i += 3) {
      this.faceColors[i] = hasChoosed ? 1 : 1
      this.faceColors[i + 1] = hasChoosed ? 1 : 0
      this.faceColors[i + 2] = hasChoosed ? 1 : 0
    }

    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.faceColors, 3),
    )
    this.geometry.attributes.color.needsUpdate = true
  }
}
