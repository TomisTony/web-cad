import hashlib
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
    
    # eq 比较不包括 children
    def __eq__(self, __value: object) -> bool:
        if isinstance(__value, BrCAD_node):
            return self.label == __value.label and self.faces == __value.faces and self.edges == __value.edges
        return False

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
        vertex_coordinates: List[float],
        uv_coordinates: List[float],
        normal_coordinates: List[float],
        triangle_indexes: List[int],
        number_of_triangles: int,
    ):
        self.id: str = None
        self.vertex_coordinates: List[float] = vertex_coordinates
        self.uv_coordinates: List[float] = uv_coordinates
        self.normal_coordinates: List[float] = normal_coordinates
        self.triangle_indexes: List[int] = triangle_indexes
        self.number_of_triangles: int = number_of_triangles
        
    def _format(self):
        self.vertex_coordinates = list(map(lambda x: round(x, 4), self.vertex_coordinates))
        self.uv_coordinates = list(map(lambda x: round(x, 4), self.uv_coordinates))
        self.normal_coordinates = list(map(lambda x: round(x, 4), self.normal_coordinates))

    def to_dict(self) -> Dict:
        return {
            "id": str(self.id),
            "vertexCoordinates": self.vertex_coordinates,
            "uvCoordinates": self.uv_coordinates,
            "normalCoordinates": self.normal_coordinates,
            "triangleIndexes": self.triangle_indexes,
            "numberOfTriangles": self.number_of_triangles,
        }
    
    def calculate_hash(self):
        # 由于每次读取 TopoDS_Shape 重新计算时可能会带来高精度上的变化，因此需要对数据进行格式化，减少小数位数
        self._format()
        attributes = []

        attributes.extend(self.vertex_coordinates)
        attributes.extend(self.uv_coordinates)
        attributes.extend(self.normal_coordinates)
        attributes.extend(self.triangle_indexes)
        attributes.append(self.number_of_triangles)

        attributes_str = [str(attr) for attr in attributes]
        hash_str = ''.join(attributes_str)

        result = hashlib.md5(hash_str.encode())
        self.id = result.hexdigest()


class BrCAD_edge:
    def __init__(self, vertex_coordinates: List[float]):
        self.id: str = None
        self.vertex_coordinates: List[float] = vertex_coordinates
        
    def _format(self):
        self.vertex_coordinates = list(map(lambda x: round(x, 4), self.vertex_coordinates))

    def to_dict(self) -> Dict:
        return {
            "id": str(self.id),
            "vertexCoordinates": self.vertex_coordinates,
        }
    
    def calculate_hash(self):
        # 由于每次读取 TopoDS_Shape 重新计算时可能会带来高精度上的变化，因此需要对数据进行格式化，减少小数位数
        self._format()
        attributes = []
        
        attributes.extend(self.vertex_coordinates)
        attributes_str = [str(attr) for attr in attributes]
        hash_str = ''.join(attributes_str)
        
        result = hashlib.md5(hash_str.encode())
        self.id = result.hexdigest()


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

    def to_json(self) -> None:
        return json.dumps(self.to_dict())
