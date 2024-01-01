import * as THREE from "three"
import { FaceMetaData } from "./types/Metadata"

export default class Model extends THREE.Mesh {
  public faceColors: number[]
  public globalFaceMetadata: Record<string, FaceMetaData>

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    colors: number[],
    globalFaceMetadata: Record<string, FaceMetaData>,
  ) {
    super(geometry, material)

    this.faceColors = colors
    this.globalFaceMetadata = globalFaceMetadata

    this.castShadow = true
    this.name = "Model"
  }

  public highlightFaceAtFaceIndex(id: string) {
    const startIndex = this.globalFaceMetadata[id].colorIndexStart
    this.faceColors[startIndex + 2] = 0
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.faceColors, 3),
    )
    this.geometry.attributes.color.needsUpdate = true
  }

  public clearHighlights() {
    // 将 color 全部置为 1
    for (let i = 0; i < this.faceColors.length; i++) {
      this.faceColors[i] = 1
    }
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.faceColors, 3),
    )
    this.geometry.attributes.color.needsUpdate = true
  }
}
