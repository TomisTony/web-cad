export interface BrCADNode {
  label: string
  faces: number[]
  edges: number[]
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
  structure: BrCADNode[]
  faces: BrCADFace[]
  edges: BrCADEdge[]
}
