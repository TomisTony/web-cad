import json
from typing import List, Dict


class BrCAD_node:
    def __init__(
        self,
        label: str,
        faces: List[int],
        edges: List[int],
        children: List["BrCAD_node"],
    ):
        self.label = label
        self.faces = faces
        self.edges = edges
        self.children = children

    def to_dict(self) -> Dict:
        return {
            "label": self.label,
            "faces": self.faces,
            "edges": self.edges,
            "children": [child.to_dict() for child in self.children],
        }


class BrCAD_face:
    def __init__(
        self,
        id: str,
        vertex_coordinates: [],
        uv_coordinates: [],
        normal_coordinates: [],
        triangle_indexes: [],
        number_of_triangles: int,
    ):
        self.id = id
        self.vertex_coordinates: List[float] = vertex_coordinates
        self.uv_coordinates: List[float] = uv_coordinates
        self.normal_coordinates: List[float] = normal_coordinates
        self.triangle_indexes: List[int] = triangle_indexes
        self.number_of_triangles: int = number_of_triangles

    def to_dict(self) -> Dict:
        return {
            "id": str(self.id),
            "vertexCoordinates": self.vertex_coordinates,
            "uvCoordinates": self.uv_coordinates,
            "normalCoordinates": self.normal_coordinates,
            "triangleIndexes": self.triangle_indexes,
            "numberOfTriangles": self.number_of_triangles,
        }


class BrCAD_edge:
    def __init__(self, id: str, vertex_coordinates: []):
        self.id: str = id
        self.vertex_coordinates: List[float] = vertex_coordinates

    def to_dict(self) -> Dict:
        return {
            "id": str(self.id),
            "vertexCoordinates": self.vertex_coordinates,
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
