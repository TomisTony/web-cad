import json
from typing import List, Dict

class BrCAD_node:
    def __init__(
        self, label: str, faces: List[int], edges: List[int], children: List["BrCAD_node"]
    ):
        self.label = label
        self.faces = faces
        self.edges = edges
        self.children = children

    def to_dict(self) -> Dict:
        return {
            "label": self.label,
            "data": {
                "faces": self.faces,
                "edges": self.edges,
            },
            "children": [child.to_dict() for child in self.children],
        }

class BrCAD_face:
    def __init__(self, id: str, vertex_coordinates: [], uv_coordinates: [], normal_coordinates: [], triangle_indexes: [], number_of_triangles: int):
        self.id = id
        self.vertex_coordinates: List[int] = vertex_coordinates
        self.uv_coordinates: List[int] = uv_coordinates
        self.normal_coordinates: List[int] = normal_coordinates
        self.triangle_indexes: List[int] = triangle_indexes
        self.number_of_triangles: int = number_of_triangles

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "vertex_coordinates": self.vertex_coordinates,
            "uv_coordinates": self.uv_coordinates,
            "normal_coordinates": self.normal_coordinates,
            "triangle_indexes": self.triangle_indexes,
            "number_of_triangles": self.number_of_triangles,
        }

class BrCAD_edge:
    def __init__(self, id: str, vertex_coordinates: []):
        self.id: int = id
        self.vertex_coordinates: List[int] = vertex_coordinates

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "vertex_coordinates": self.vertex_coordinates,
        }

class BrCAD:
    def __init__(
        self,
        structure: BrCAD_node,
        faces: List[BrCAD_face],
        edges: List[BrCAD_edge],
    ):
        self.structure = structure
        self.faces = faces
        self.edges = edges

    def to_dict(self) -> Dict:
        return {
            "structure": self.structure.to_dict(),
            "faces": [face.to_dict() for face in self.faces],
            "edges": [edge.to_dict() for edge in self.edges],
        }

    def to_json(self, path: str) -> None:
        with open(path, "w") as f:
            json.dump(self.to_dict(), f)


# # 构建一些面和边
# face1 = BrCAD_face(id="f1", shape="rectangle", color="red", layer="L1", material="steel")
# face2 = BrCAD_face(id="f2", shape="circle", color="blue", layer="L1", material="steel")
# edge1 = BrCAD_edge(id="e1", shape="line", color="green", layer="L2", material="steel")
# edge2 = BrCAD_edge(id="e2", shape="line", color="yellow", layer="L2", material="steel")

# faces = {face1.id: face1, face2.id: face2}
# edges = {edge1.id: edge1, edge2.id: edge2}

# # 创建节点的数据结构
# root_child = BrCAD_node(label="child1", faces=[face1.id], edges=[edge1.id], children=[])
# root = BrCAD_node(label="root", faces=[face2.id], edges=[edge2.id], children=[root_child])

# # 创建 BrCAD 对象并保存为 JSON
# br_cad = BrCAD(structure=root, faces=faces, edges=edges)
# br_cad.to_json("output.json")

'''
output.json:
{
  "structure": {
    "label": "root",
    "data": {
      "faces": [
        "f2"
      ],
      "edges": [
        "e2"
      ]
    },
    "children": [
      {
        "label": "child1",
        "data": {
          "faces": [
            "f1"
          ],
          "edges": [
            "e1"
          ]
        },
        "children": []
      }
    ]
  },
  "faces": [
    {
      "id": "f1",
      "shape": "rectangle",
      "color": "red",
      "layer": "L1",
      "material": "steel"
    },
    {
      "id": "f2",
      "shape": "circle",
      "color": "blue",
      "layer": "L1",
      "material": "steel"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "shape": "line",
      "color": "green",
      "layer": "L2",
      "material": "steel"
    },
    {
      "id": "e2",
      "shape": "line",
      "color": "yellow",
      "layer": "L2",
      "material": "steel"
    }
  ]
}
'''
