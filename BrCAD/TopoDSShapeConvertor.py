from typing import List, Dict

from OCC.Core.TopoDS import TopoDS_Shape
from BrCAD.BrCAD import BrCAD_node, BrCAD_face, BrCAD_edge, BrCAD

class TopoDSShapeConvertor:
  def __init__(self, topods_shape: TopoDS_Shape):
    self.topods_shape = topods_shape
    self.faces: List[BrCAD_face] = []
    self.edges: List[BrCAD_edge] = []
    self.faces, self.edges = self._converte()
  
  def get_faces(self):
    return self.faces
  
  def get_edges(self):
    return self.edges
  
  def get_BrCAD(self):
    # 目前并没有做 structure 的适配，统一使用 root
    return BrCAD(
      structure=BrCAD_node(
        label="root",
        faces=[face.id for face in self.faces],
        edges=[edge.id for edge in self.edges],
        children=[]
      ),
      faces=self.faces,
      edges=self.edges
    )
    
  def _converte(self) -> (List[BrCAD_face], List[BrCAD_edge]):
    return self.topods_shape, self.topods_shape