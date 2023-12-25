export interface BrCADNode {
  label: string
  faces: string[]
  edges: string[]
  children: BrCADNode[]
}

export interface BrCADFace {
  id: string
  vertexCoordinates: number[]
  uvCoordinates: number[]
  normalCoordinates: number[]
  triangleIndexes: number[]
  numberOfTriangles: number
}

export interface BrCADEdge {
  id: string
  vertexCoordinates: number[]
}

export interface BrCAD {
  structure: BrCADNode
  faces: BrCADFace[]
  edges: BrCADEdge[]
}
