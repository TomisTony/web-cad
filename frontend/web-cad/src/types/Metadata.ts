export interface FaceMetaData {
  id: string
  colorIndexStart: number
  // face 固定只有三个 vertex，所以不需要 colorIndexEnd
}

export interface EdgeMetaData {
  id: string
  colorIndexStart: number
  colorIndexEnd: number
}
