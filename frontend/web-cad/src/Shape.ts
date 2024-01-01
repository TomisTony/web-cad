import * as THREE from "three"
import { ThreeApp } from "./ThreeApp"
import { BrCAD, BrCADEdge } from "./types/BrCAD"
import { EdgeMetaData, FaceMetaData } from "./types/Metadata"
import Model from "./Model"
import Line from "./Line"

export class Shape {
  public mainObject: THREE.Group = new THREE.Group()

  // 权宜之计，material 之后要额外处理
  private static _modelMaterial: THREE.MeshPhongMaterial = null as any
  /**
   * 模型材质
   */
  public static get modelMaterial(): THREE.MeshPhongMaterial {
    if (this._modelMaterial == null) {
      const loader = new THREE.TextureLoader()
      loader.setCrossOrigin("")
      const matcap = loader.load("./dullFrontLitMetal.png")
      const m: any = new THREE.MeshMatcapMaterial({
        // color: new THREE.Color(0xf5f5f5),
        vertexColors: true,
        matcap: matcap,
        polygonOffset: true, // Push the mesh back for line drawing
        polygonOffsetFactor: 2.0,
        polygonOffsetUnits: 1.0,
      })
      this._modelMaterial = m
    }
    return this._modelMaterial
  }

  private static _lineMaterial: THREE.LineBasicMaterial = null as any

  public static get lineMaterial(): THREE.LineBasicMaterial {
    if (this._lineMaterial == null) {
      this._lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 1.5,
        vertexColors: true,
      })
    }
    return this._lineMaterial
  }

  public setBrCADToScene(brCAD: BrCAD) {
    const faceList = brCAD.faces
    const edgeList = brCAD.edges

    if (faceList && faceList.length > 0) {
      const vertices: number[] = [],
        normals: number[] = [],
        triangles: number[] = [],
        uvs: number[] = [],
        colors: number[] = []
      const globalFaceMetadata: Record<string, FaceMetaData> = {}
      const faceIds: string[] = [] // 用于按照每个 vertice 在数组里面的排列顺序记录 face 的 id，用于后续的 raycast
      let vInd = 0
      faceList.forEach((face) => {
        // Copy Vertices into three.js Vector3 List
        vertices.push(...face.vertexCoordinates)
        normals.push(...face.normalCoordinates)
        uvs.push(...face.uvCoordinates)

        for (let i = 0; i < face.vertexCoordinates.length / 3; i++) {
          faceIds.push(face.id)
        }

        // Sort Triangles into a three.js Face List
        for (let i = 0; i < face.triangleIndexes.length; i += 3) {
          triangles.push(
            face.triangleIndexes[i + 0] + vInd,
            face.triangleIndexes[i + 1] + vInd,
            face.triangleIndexes[i + 2] + vInd,
          )
        }
        // Use Vertex Color to label this face's indices for raycast picking
        const faceMetaData = {
          id: face.id,
          colorIndexStart: colors.length,
          colorIndexEnd: colors.length + face.vertexCoordinates.length,
        }
        for (let i = 0; i < face.vertexCoordinates.length; i += 3) {
          colors.push(1, 1, 1)
        }
        globalFaceMetadata[faceMetaData.id] = faceMetaData
        vInd += face.vertexCoordinates.length / 3
      })
      // Compile the connected vertices and faces into a model
      // And add to the scene
      const geometry = new THREE.BufferGeometry()
      geometry.setIndex(triangles)
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
      )
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(normals, 3),
      )
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      )
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
      geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(uvs, 2))
      geometry.computeBoundingSphere()
      geometry.computeBoundingBox()
      const model = new Model(
        geometry,
        Shape.modelMaterial,
        colors,
        globalFaceMetadata,
        faceIds,
      )

      this.mainObject.add(model as THREE.Object3D)
    }

    if (edgeList && edgeList.length > 0) {
      // 以下代码将使用 LineSegment, 其两两一组分割来绘制线段
      // 一个 edge 可能不止两个 point
      const lineVertices: THREE.Vector3[] = []
      const globalEdgeMetadata: Record<string, EdgeMetaData> = {}
      const edgeIds: string[] = [] // 用于按照每个 vertice 在数组中的顺序记录 edge 的 id，用于后续的 raycast

      // 用于记录每个 edge 的起始和结束 index
      let colorIndexCounter = 0
      edgeList.forEach((edge: BrCADEdge) => {
        const edgeMetaData = {} as EdgeMetaData
        edgeMetaData.id = edge.id
        edgeMetaData.colorIndexStart = colorIndexCounter
        // 根据 LineSegment 的构造风格，一个 edge 中每两个点构成一条线段
        for (let i = 0; i < edge.vertexCoordinates.length - 3; i += 3) {
          lineVertices.push(
            new THREE.Vector3(
              edge.vertexCoordinates[i],
              edge.vertexCoordinates[i + 1],
              edge.vertexCoordinates[i + 2],
            ),
          )

          lineVertices.push(
            new THREE.Vector3(
              edge.vertexCoordinates[i + 3],
              edge.vertexCoordinates[i + 1 + 3],
              edge.vertexCoordinates[i + 2 + 3],
            ),
          )
          edgeIds.push(edge.id, edge.id)
          colorIndexCounter += 2 * 3
        }
        edgeMetaData.colorIndexEnd = colorIndexCounter
        globalEdgeMetadata[edgeMetaData.id] = edgeMetaData
      })

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(
        lineVertices,
      )
      const lineColors = []
      for (let i = 0; i < lineVertices.length; i++) {
        lineColors.push(0, 0, 0)
      }
      lineGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(lineColors, 3),
      )
      const line = new Line(
        lineGeometry,
        Shape.lineMaterial,
        lineColors,
        globalEdgeMetadata,
        edgeIds,
      )

      this.mainObject.add(line as any)
    }
    ThreeApp.threeScene.obj = this.mainObject
    ThreeApp.threeScene.scene.add(this.mainObject)
  }
}
