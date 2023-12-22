from typing import List, Dict

from OCC.Core.TopoDS import TopoDS_Shape
from OCC.Core.TopAbs import TopAbs_EDGE, TopAbs_FACE, TopAbs_SHAPE
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.BRep import BRep_Tool
from OCC.Core.gp import gp_Pnt
from OCC.Core.TopAbs import TopAbs_FORWARD
from OCC.Core.StdPrs import StdPrs_ToolTriangulatedShape
from OCC.Core.TColgp import TColgp_Array1OfDir
from OCC.Core.Poly import Poly_Connect

from BrCAD.BrCAD import BrCAD_node, BrCAD_face, BrCAD_edge, BrCAD

MAX_SAFE_INT = 2**31 - 1


class TopoDSShapeConvertor:
    def __init__(self, topods_shape: TopoDS_Shape, max_deviation: float = 0.1):
        self.topods_shape = topods_shape
        self.max_deviation = max_deviation
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
                children=[],
            ),
            faces=self.faces,
            edges=self.edges,
        )

    def _converte(self) -> (List[BrCAD_face], List[BrCAD_edge]):
        faceList: List[BrCAD_face] = []
        edgeList: List[BrCAD_edge] = []
        edge_hashes = self._get_edge_hashes(self.topods_shape)
        face_hashes = self._get_face_hashes(self.topods_shape)
        # 开启 mesh 化
        BRepMesh_IncrementalMesh(self.topods_shape, self.max_deviation, False, self.max_deviation * 5, False)
        # 遍历所有面
        faceExp = TopExp_Explorer(self.topods_shape, TopAbs_FACE, TopAbs_SHAPE)
        while faceExp.More():
            face = faceExp.Current()
            location = TopLoc_Location()
            # 检查该面的 mesh 化是否成功
            triangulation = BRep_Tool().Triangulation(face, location)
            if triangulation is None:
                faceExp.Next()
                continue
            
            brcad_face: BrCAD_face = BrCAD_face(
                # 这里的 id 需要注意
                id=face.HashCode(MAX_SAFE_INT),
                vertex_coordinates=[],
                uv_coordinates=[],
                normal_coordinates=[],
                triangle_indexes=[],
                number_of_triangles=0
            )
            
            # WARNING: 这个地方的 api 不一定正确,尤其是下面的 range
            node_count = triangulation.NbNodes()
            nodes: List[gp_Pnt] = []
            for i in range(1, node_count + 1):
                node = triangulation.Node(i)
                nodes.append(node)
                       
            # 填充 vertex_coordinates
            for node in nodes:
                point = node.Transformed(location.Transformation())
                brcad_face.vertex_coordinates.append(point.X())
                brcad_face.vertex_coordinates.append(point.Y())
                brcad_face.vertex_coordinates.append(point.Z())
            
            # 填充 uv_coordinates
            orient = face.Orientation()
            if triangulation.HasUVNodes():
                UMin = UMax = VMin = VMax = 0
                uv_nodes = triangulation.MapUVNodeArray()
                for i in range(1, uv_nodes.Length() + 1):
                    uv_node = uv_nodes.Value(i)
                    brcad_face.uv_coordinates.append(uv_node.X())
                    brcad_face.uv_coordinates.append(uv_node.Y())
                    # 计算 UV Bounds
                    if i == 1:
                        UMin = UMax = uv_node.X()
                        VMin = VMax = uv_node.Y()
                    else:
                        UMin = min(UMin, uv_node.X())
                        UMax = max(UMax, uv_node.X())
                        VMin = min(VMin, uv_node.Y())
                        VMax = max(VMax, uv_node.Y())
                # normalize uv
                for i in range(0, len(brcad_face.uv_coordinates), 2):
                    x = brcad_face.uv_coordinates[i]
                    y = brcad_face.uv_coordinates[i + 1]
                    x = (x - UMin) / (UMax - UMin)
                    y = (y - VMin) / (VMax - VMin)
                    if orient == TopAbs_FORWARD:
                        x = 1 - x
                    brcad_face.uv_coordinates[i] = x
                    brcad_face.uv_coordinates[i + 1] = y
            
            # 填充 normal_coordinates
            normals =  TColgp_Array1OfDir(1, len(nodes))  
            pc = Poly_Connect(triangulation)
            StdPrs_ToolTriangulatedShape.Normal(face, pc, normals)
            for i in range(1, normals.Length() + 1):
                normal = normals.Value(i).Transformed(location.Transformation())
                brcad_face.normal_coordinates.append(normal.X())
                brcad_face.normal_coordinates.append(normal.Y())
                brcad_face.normal_coordinates.append(normal.Z())
                
            # 填充 triangle_indexes
            faceList.append(brcad_face)
            faceExp.Next()      
                
                
            
        return faceList, edgeList

    def _get_edge_hashes(self, shape: TopoDS_Shape) -> Dict[str, int]:
        edge_hashes = {}
        edge_index = 0
        edgeExp = TopExp_Explorer(shape, TopAbs_EDGE, TopAbs_SHAPE)
        while edgeExp.More():
            edge = edgeExp.Current()
            hash = edge.HashCode(MAX_SAFE_INT)
            if hash not in edge_hashes:
                edge_hashes[hash] = edge_index
                edge_index += 1
            edgeExp.Next()
        return edge_hashes
    
    def _get_face_hashes(self, shape: TopoDS_Shape) -> Dict[str, int]:
        face_hashes = {}
        face_index = 0
        faceExp = TopExp_Explorer(shape, TopAbs_EDGE, TopAbs_SHAPE)
        while faceExp.More():
            face = faceExp.Current()
            hash = face.HashCode(MAX_SAFE_INT)
            face_hashes[hash] = face_index
            face_index += 1
            faceExp.Next()
        return face_hashes
