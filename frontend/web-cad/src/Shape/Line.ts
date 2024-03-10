import * as THREE from "three"
import { EdgeMetaData } from "@/types/Metadata"

import store from "@/app/store"

export default class Line extends THREE.LineSegments {
  public lineColors: number[]
  public globalEdgeMetadata: Record<string, EdgeMetaData>
  public edgeIds: string[]

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    colors: number[],
    globalEdgeMetadata: Record<string, EdgeMetaData>,
    edgeIds: string[],
  ) {
    super(geometry, material)

    this.lineColors = colors
    this.globalEdgeMetadata = globalEdgeMetadata
    this.edgeIds = edgeIds

    this.name = "Model Edges"
  }

  public highlightAtIndex(id: string) {
    if (!this.globalEdgeMetadata[id]) return

    // 如果已经被选中，就不再高亮
    const choosedIdList = store.getState().model.choosedIdList
    const hasChoosed = choosedIdList.includes(id)
    if (hasChoosed) return

    const startIndex = this.globalEdgeMetadata[id].colorIndexStart
    const endIndex = this.globalEdgeMetadata[id].colorIndexEnd
    for (let i = startIndex; i < endIndex; i++) {
      this.lineColors[i] = 1
    }
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.lineColors, 3),
    )
    this.geometry.attributes.color.needsUpdate = true
  }

  public clearHighlights() {
    // 已经被选中的不变，其余置为 0
    const choosedIdList = store.getState().model.choosedIdList
    const startIndexList: number[] = []
    const endIndexList: number[] = []
    choosedIdList.forEach((id) => {
      if (!this.globalEdgeMetadata[id]) return
      startIndexList.push(this.globalEdgeMetadata[id].colorIndexStart)
      endIndexList.push(this.globalEdgeMetadata[id].colorIndexEnd)
    })
    // 一次遍历，如果遇到位于 startIndex 的 i，则直接跳过到 endIndex
    let i = 0
    while (i < this.lineColors.length) {
      if (startIndexList.includes(i)) {
        i = endIndexList[startIndexList.indexOf(i)]
      } else {
        this.lineColors[i] = 0
        i++
      }
    }

    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.lineColors, 3),
    )
    this.geometry.attributes.color.needsUpdate = true
  }

  public toggleChoosedHighlightAtIndex(id: string) {
    if (!this.globalEdgeMetadata[id]) return

    const choosedIdList = store.getState().model.choosedIdList
    const hasChoosed = choosedIdList.includes(id)

    const startIndex = this.globalEdgeMetadata[id].colorIndexStart
    const endIndex = this.globalEdgeMetadata[id].colorIndexEnd
    for (let i = startIndex; i < endIndex; i += 3) {
      this.lineColors[i] = hasChoosed ? 0 : 1
      this.lineColors[i + 1] = hasChoosed ? 0 : 0
      this.lineColors[i + 2] = hasChoosed ? 0 : 0
    }
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.lineColors, 3),
    )
    this.geometry.attributes.color.needsUpdate = true
  }
}
