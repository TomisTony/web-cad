from typing import List, Dict, Tuple
import uuid

from OCC.Core.TopoDS import TopoDS_Shape
from OCC.Core.TopAbs import TopAbs_EDGE, TopAbs_FACE, TopAbs_SHAPE, TopAbs_SOLID
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.BRep import BRep_Tool
from OCC.Core.gp import gp_Pnt
from OCC.Core.TopAbs import TopAbs_FORWARD
from OCC.Core.StdPrs import StdPrs_ToolTriangulatedShape
from OCC.Core.TColgp import TColgp_Array1OfDir
from OCC.Core.Poly import Poly_Connect
from OCC.Core.BRepAdaptor import BRepAdaptor_Curve
from OCC.Core.GCPnts import GCPnts_TangentialDeflection

from BrCAD.BrCAD import BrCAD_node, BrCAD_face, BrCAD_edge, BrCAD

MAX_SAFE_INT = 2**31 - 1


class TopoDSShapeConvertor:
    def __init__(self, topods_shape: TopoDS_Shape, max_deviation: float = 0.1):
        self.topods_shape = topods_shape
        self.max_deviation = max_deviation
        # 储存了 face/edge/solid 的 id 到 TopoDS_Shape 的映射
        self.id_TopoDS_Shape_map: Dict[str, TopoDS_Shape] = {}
        # 储存了 solid 的 id 到 (face_list, edge_list) 的映射
        self.solid_dict = self.__converte()
  
    # 使用新的 structure 生成 BrCAD 对象，仅用于 import 和新建基本图形
    def get_BrCAD_with_new_structure(self):
        # 根据 solid_dict 生成 BrCAD 对象
        children: List[BrCAD_node] = []
        faces: List[BrCAD_face] = []
        edges: List[BrCAD_edge] = []
        for solid_id, (face_list, edge_list) in self.solid_dict.items():
            # 构造子 solid, 其中 face 和 edge 分别是 id 数组
            child = BrCAD_node(
                label="Solid",
                id=solid_id,
                children=[],
                faces=[face.id for face in face_list],
                edges=[edge.id for edge in edge_list],
            )
            children.append(child)
            faces.extend(face_list)
            edges.extend(edge_list)
        
        return BrCAD(
            structure= BrCAD_node(
                label="Root",
                children=children,
                faces=[],
                edges=[],
            ),
            faces=faces,
            edges=edges,
        )
    
    # 参考之前的 structure 生成 BrCAD 对象，若存在之前的 BrCAD，则使用本方法
    # 生成的 BrCAD 才是拥有真实 structure 结构的 BrCAD
    # WARNING: 我们这里会对之前的 BrCAD 进行修改，因此需要注意深拷贝
    # old_brcad: 之前的 BrCAD 对象
    # operation_label: 操作的标签，用于生成新的 BrCAD_node 对象的 label
    # unchange_solid_id: 是否尽量延用 solid 的 id
    def get_BrCAD_after_operation(self, old_brcad_unchangeable: BrCAD, operation_label: str, unchange_solid_id: bool = True):
        # 深拷贝 old_brcad
        import pickle
        old_brcad: BrCAD = pickle.loads(pickle.dumps(old_brcad_unchangeable))

        old_faces_id_list = [face.id for face in old_brcad.faces]
        old_edges_id_list = [edge.id for edge in old_brcad.edges]
        new_faces_id_list = []
        new_edges_id_list = []
        # 生成新的 face 和 edge 的 id 数组
        for solid_name, (face_list, edge_list) in self.solid_dict.items():
            new_faces_id_list.extend([face.id for face in face_list])
            new_edges_id_list.extend([edge.id for edge in edge_list])
        # 比较 old_face_id_list 和 new_face_id_list，生成 deleted_faces_id 和 added_faces_id
        deleted_faces_id = list(set(old_faces_id_list) - set(new_faces_id_list))
        added_faces_id = list(set(new_faces_id_list) - set(old_faces_id_list))
        # 比较 old_edge_id_list 和 new_edge_id_list，生成 deleted_edges_id 和 added_edges_id
        deleted_edges_id = list(set(old_edges_id_list) - set(new_edges_id_list))
        added_edges_id = list(set(new_edges_id_list) - set(old_edges_id_list))
        # 在 solid_dict 中查找，找到拥有 deleted_faces_id 和 deleted_edges_id 中的 id 的 solid
        # 这里需要在 old_brcad 中查找 deleted_faces_id 和 deleted_edges_id 的 归属 solid
        related_solid_id = []
        old_solid_dict = {}
        for node in old_brcad.structure.children:
            old_solid_dict[node.id] = self.__get_id_list_from_brcad_node(node)
        for solid_id, (face_list, edge_list) in old_solid_dict.items():
            if set(face_list) & set(deleted_faces_id) or set(edge_list) & set(deleted_edges_id):
                related_solid_id.append(solid_id)
        # 生成新的 structure
        children: List[BrCAD_node] = []
        faces: List[BrCAD_face] = []
        edges: List[BrCAD_edge] = []
        new_node_faces_id_list = new_faces_id_list.copy()
        new_node_edges_id_list = new_edges_id_list.copy()
        for solid_id, (face_list, edge_list) in self.solid_dict.items():
            faces.extend(face_list)
            edges.extend(edge_list)
            # 如果 solid_id 不在 related_solid_id 中，则保留 old_brcad 中的 structure
            # 在 related_solid_id 中的 solid 特殊处理
            if solid_id not in related_solid_id:
                for node in old_brcad.structure.children:
                    if node.id == solid_id:
                        children.append(node)
                        new_node_faces_id_list = list(set(new_node_faces_id_list) - set(node.faces))
                        new_node_edges_id_list = list(set(new_node_edges_id_list) - set(node.edges))
        # 新建一个 BrCAD_node，添加所有收集的 solid 为 child，转换这些 solid 的所有数据合并新的更改（包括 delete 和 add）到该 node 下
        # 如果只有一个 solid 被更改，则尽量保留其 id
        new_node_id = uuid.uuid1().hex
        if unchange_solid_id and len(related_solid_id) == 1:
            new_node_id = related_solid_id[0]
        # 构造新 node 的 children，由 related_solid_id 中的 solid 构造
        new_node_children = []
        # 从 old_brcad 中的 structure 中找到这些 node，将其 faces 和 edges 置空，然后将其添加到新的 node 中
        for solid_id in related_solid_id:
            for node in old_brcad.structure.children:
                deep_copy_node: BrCAD_node = pickle.loads(pickle.dumps(node))
                if deep_copy_node.id == solid_id:
                    deep_copy_node.faces = []
                    deep_copy_node.edges = []
                    new_node_children.append(deep_copy_node)
        
        # 重新计算 face/edge 的 id
        
        
        # 使用新的 id 构造新的 BrCAD_node    
        new_node = BrCAD_node(
          label=operation_label,
          id=new_node_id,
          children=new_node_children,
          faces=new_node_faces_id_list,
          edges=new_node_edges_id_list,
        )
        children.append(new_node)
        # 构造新的 BrCAD 对象
        new_brcad = BrCAD(
            structure= BrCAD_node(
                label="Root",
                children=children,
                faces=[],
                edges=[],
            ),
            faces=faces,
            edges=edges,
        )
        return new_brcad
        
    
    # 递归获得一个 BrCAD_node 下的所有 face 和 edge 的 id
    def __get_id_list_from_brcad_node(self, node: BrCAD_node) -> Tuple[List[str],List[str]]:
        face_id_list = []
        edge_id_list = []
        face_id_list.append(node.faces)
        edge_id_list.append(node.edges)
        for child in node.children:
            child_face_id_list, child_edge_id_list = self.__get_id_list_from_brcad_node(child)
            face_id_list.extend(child_face_id_list)
            edge_id_list.extend(child_edge_id_list)
        return face_id_list, edge_id_list       
    
    def get_id_TopoDS_Shape_map(self):
        return self.id_TopoDS_Shape_map

    def __converte_topo(self, topo: TopoDS_Shape, solid_id: str) -> Tuple[List[BrCAD_face], List[BrCAD_edge]]:
        face_list: List[BrCAD_face] = []
        edge_list: List[BrCAD_edge] = []
        # 开启 mesh 化
        BRepMesh_IncrementalMesh(topo, self.max_deviation, False, self.max_deviation * 5, False)
        
        # 由于我们在遍历所有面的时候就会开始填充 edgeList，所以需要一个 set 来记录已经填充过的 edge
        complete_edge_set = set()
        
        # 遍历所有面
        faceExp = TopExp_Explorer(topo, TopAbs_FACE, TopAbs_SHAPE)
        while faceExp.More():
            face = faceExp.Current()
            location = TopLoc_Location()
            # 检查该面的 mesh 化是否成功
            triangulation = BRep_Tool().Triangulation(face, location)
            if triangulation is None:
                faceExp.Next()
                continue
            
            brcad_face: BrCAD_face = BrCAD_face(
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
            triangles = triangulation.Triangles()
            validFaceTriangleCount = 0
            for i in range(1, triangulation.NbTriangles() + 1):
                triangle = triangles.Value(i)
                node1 = triangle.Value(1)
                node2 = triangle.Value(2)
                node3 = triangle.Value(3)
                if orient != TopAbs_FORWARD:
                    node1, node2 = node2, node1
                brcad_face.triangle_indexes.append(node1 - 1)
                brcad_face.triangle_indexes.append(node2 - 1)
                brcad_face.triangle_indexes.append(node3 - 1)
                validFaceTriangleCount += 1
            brcad_face.number_of_triangles = validFaceTriangleCount
            # 计算 hash 作为 id
            brcad_face.calculate_hash(solid_id)
            self.id_TopoDS_Shape_map[brcad_face.id] = face
            face_list.append(brcad_face)
            
            # 在每一个面中遍历所有 edge，这些边可能是三角化之后新产生的
            edgeExp = TopExp_Explorer(face, TopAbs_EDGE, TopAbs_SHAPE)
            while edgeExp.More():
                edge = edgeExp.Current()
                # OCC 的 hash 跟内存地址相关，但是由于我们这里的使用是在单次程序中，所以可以认为是唯一标识符
                hash = edge.HashCode(MAX_SAFE_INT)
                # 为什么这里是 in 而不是 not in 呢
                # 因为我们在三角化 face 之后会产生很多边，而这些新产生的边是我们不要的
                # 这些边的特征就是，只会出现一次；而我们要的那些原本图形的边是会出现多次的（因为会被多个面共享）
                # 所以能够被二次探测的边才是我们要的边
                if hash in complete_edge_set:
                    brcad_edge = BrCAD_edge(
                        vertex_coordinates=[],
                    )
                    poly = BRep_Tool().PolygonOnTriangulation(edge, triangulation, location)
                    # 一条 edge 可能会有多个 node，比如曲线，不然无法近似描述这条 edge
                    edge_nodes = poly.Nodes()                    
                    # 填充 vertex_coordinates
                    for i in range(1, edge_nodes.Length() + 1):
                        vertex_index = edge_nodes.Value(i)
                        brcad_edge.vertex_coordinates.append(brcad_face.vertex_coordinates[(vertex_index - 1) * 3 + 0])
                        brcad_edge.vertex_coordinates.append(brcad_face.vertex_coordinates[(vertex_index - 1) * 3 + 1])
                        brcad_edge.vertex_coordinates.append(brcad_face.vertex_coordinates[(vertex_index - 1) * 3 + 2])
                    brcad_edge.calculate_hash(solid_id)
                    self.id_TopoDS_Shape_map[brcad_edge.id] = edge
                    edge_list.append(brcad_edge)
                else:
                    complete_edge_set.add(hash)
                edgeExp.Next()
            faceExp.Next()      

        # 并不一定所有的边都在 face 中，而且这些边我们需要特殊处理，所以我们需要额外遍历
        edgeExp = TopExp_Explorer(topo, TopAbs_EDGE, TopAbs_SHAPE) 
        while edgeExp.More():
            edge = edgeExp.Current()
             # OCC 的 hash 跟内存地址相关，但是由于我们这里的使用是在单次程序中，所以可以认为是唯一标识符
            hash = edge.HashCode(MAX_SAFE_INT)
            if hash not in complete_edge_set:
                brcad_edge = BrCAD_edge(
                    id=str(hash),
                    vertex_coordinates=[],
                )
                location = TopLoc_Location()
                adaptorCurve = BRepAdaptor_Curve(edge)
                tangDef = GCPnts_TangentialDeflection(adaptorCurve, self.max_deviation, 0.1)                  
                # 填充 vertex_coordinates
                for i in range(1, tangDef.NbPoints() + 1):
                    vertex = tangDef.Value(i).Transformed(location.Transformation())
                    brcad_edge.vertex_coordinates.append(vertex.X())
                    brcad_edge.vertex_coordinates.append(vertex.Y())
                    brcad_edge.vertex_coordinates.append(vertex.Z())
                complete_edge_set.add(hash)
                brcad_edge.calculate_hash(solid_id)
                self.id_TopoDS_Shape_map[brcad_edge.id] = edge
                edge_list.append(brcad_edge)
            edgeExp.Next() 
                   
        return face_list, edge_list 
    
    def __converte(self) -> Dict[str, Tuple[List[BrCAD_face], List[BrCAD_edge]]]:
        solid_dict: Dict[str, Tuple[List[BrCAD_face], List[BrCAD_edge]]] = {}
        
        # 遍历所有的 solid
        count = 0
        solid_exp = TopExp_Explorer(self.topods_shape, TopAbs_SOLID, TopAbs_SHAPE)
        while solid_exp.More():
            count += 1
            solid = solid_exp.Current()
            solid_id = uuid.uuid1().hex
            self.id_TopoDS_Shape_map[solid_id] = solid
            solid_dict[solid_id] = self.__converte_topo(solid, solid_id)
            solid_exp.Next()
            
        # 为了防止没有 solid 的情况
        if count == 0:
            solid_id = uuid.uuid1().hex
            self.id_TopoDS_Shape_map[solid_id] = self.topods_shape
            solid_dict[solid_id] = self.__converte_topo(self.topods_shape, solid_id)
            
        return solid_dict
