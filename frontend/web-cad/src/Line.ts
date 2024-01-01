import * as THREE from "three"
import { EdgeMetaData } from "./types/Metadata"

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

  public highlightEdgeAtLineIndex(id: string) {
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
    for (let i = 0; i < this.lineColors.length; i++) {
      this.lineColors[i] = 0
    }
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.lineColors, 3),
    )
    this.geometry.attributes.color.needsUpdate = true
  }
}
