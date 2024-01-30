from typing import List, Dict, Tuple
from BrCAD.BrCAD import BrCAD, BrCAD_face, BrCAD_edge, BrCAD_node


class BrCADCompareStructureNode:
    def __init__(
        self,
        label: str,
        status: str,
        faces: List[int],
        edges: List[int],
        children: List["BrCADCompareStructureNode"],
    ):
        self.label: str = label
        # status 有 "unchanged"/"children_changed"/"changed"
        self.status: str = status
        self.faces: List[int] = faces
        self.edges: List[int] = edges
        self.children: BrCADCompareStructureNode | BrCAD_node = children

    def to_dict(self) -> Dict:
        return {
            "label": self.label,
            "status": self.status,
            "faces": self.faces,
            "edges": self.edges,
            "children": [child.to_dict() for child in self.children],
        }


class BrCADCompare:
    def __init__(self, origin_model: BrCAD, new_model: BrCAD):
        self.origin_model = origin_model
        self.new_model = new_model
        self.structure_diff: BrCADCompareStructureNode = None
        self.deleted_faces_id: List[str] = []
        self.added_faces_id: List[str] = []
        self.deleted_edges_id: List[str] = []
        self.added_edges_id: List[str] = []
        self.__compare()

    def __compare(self):
        self.__faces_compare()
        self.__edges_compare()
        self.structure_diff = self.__structure_compare(
            self.origin_model.structure, self.new_model.structure
        )[1]

    # 第一个返回的参数为 children_change flag，代表这轮递归是否存在子节点的变化
    # 第二个返回的参数为构造好的 BrCADCompareStructureNode
    def __structure_compare(
        self, origin_node: BrCAD_node, new_node: BrCAD_node
    ) -> Tuple[bool, BrCADCompareStructureNode]:
        # 比较两个 BrCAD 的 structure,并生成 BrCADCompareStructureNode
        # 思路上可以看做树形结构的比较，使用递归
        # 由于我们会在父节点就比较两者的子节点数组是否一致，因此不必担心两者为 None 的问题
        status = "unchanged"
        # step1: 检查当前节点 的 faces、edges、label 是否改变，如果改变就直接赋 changed，
        # 构造 diff node，结束递归，向上传递 children_change flag 和 diff node
        if origin_node != new_node:
            status = "changed"
            diff_node = BrCADCompareStructureNode(
                new_node.label,
                status,
                new_node.faces,
                new_node.edges,
                new_node.children,
            )
            return True, diff_node

        # step2: 如果没有改变，则比较该节点的 children 的基本属性（不包括 children 的 children），
        # 如果发生了改变，则直接赋 changed，构造 diff node，结束递归，向上传递
        # children_change flag 和 diff node
        if origin_node.children != new_node.children:
            status = "changed"
            diff_node = BrCADCompareStructureNode(
                new_node.label,
                status,
                new_node.faces,
                new_node.edges,
                new_node.children,
            )
            return True, diff_node
        
        # step3: 如果依然没有改变，则开启循环，循环内递归 children。如果循环中有任意 children 的
        # 递归返回了 children_change flag，则本节点的 status 修改为 children_change
        chidren = []
        for index, child in enumerate(origin_node.children):
            children_change_flag, diff_node = self.__structure_compare(
                child, new_node.children[index]
            )
            chidren.append(diff_node)
            if children_change_flag:
                status = "children_changed"
        
        # 此时 status 必定为 children_changed 或 unchanged  
        # step4: 结束递归，构造 diff node（为了节约空间， faces 数组和 edges 数组将为空数组） 
        # 并向上传递本节点的 children_change flag
        diff_node = BrCADCompareStructureNode(
            new_node.label,
            status,
            [],
            [],
            chidren,
        )
        return status == "children_changed", diff_node

    def __faces_compare(self):
        # 把不存在 new_model 中的 face 的 id 加入 deleted_faces_id
        # 把不存在 origin_model 中的 face 加入 added_faces_id
        origin_model_ids = [face.id for face in self.origin_model.faces]
        new_model_ids = [face.id for face in self.new_model.faces]
        for id in origin_model_ids:
            if id not in new_model_ids:
                self.deleted_faces_id.append(id)
        for id in new_model_ids:
            if id not in origin_model_ids:
                self.added_faces_id.append(id)

    def __edges_compare(self):
        # 把不存在 new_model 中的 edge 的 id 加入 deleted_edges_id
        # 把不存在 origin_model 中的 edge 加入 added_edges_id
        origin_model_ids = [edge.id for edge in self.origin_model.edges]
        new_model_ids = [edge.id for edge in self.new_model.edges]
        for id in origin_model_ids:
            if id not in new_model_ids:
                self.deleted_edges_id.append(id)
        for id in new_model_ids:
            if id not in origin_model_ids:
                self.added_edges_id.append(id)

    def get_diff(self) -> Dict:
        added_faces = []
        added_edges = []
        for face_id in self.added_faces_id:
            for face in self.new_model.faces:
                if face.id == face_id:
                  added_faces.append(face)
        for edge_id in self.added_edges_id:
            for edge in self.new_model.edges:
                if edge.id == edge_id:
                  added_edges.append(edge)
        return {
            "structure": self.structure_diff.to_dict(),
            "delete":{
                "face_ids": self.deleted_faces_id,
                "edge_ids": self.deleted_edges_id,
            },
            "add":{
                "faces": [face.to_dict() for face in added_faces],
                "edges": [edge.to_dict() for edge in added_edges],
            },
        }
