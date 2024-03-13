from typing import List, Dict, Tuple
from cad.models import Solid

from BrCAD.BrCAD import BrCAD, BrCAD_face, BrCAD_edge, BrCAD_node
from OCC.Core.TopoDS import TopoDS_Shape, TopoDS_Solid, TopoDS_Compound
from OCC.Core.BRep import BRep_Builder

import pickle


def get_solid_by_id(solid_id: str) -> TopoDS_Solid:
    solid = Solid.objects.get(solid_id=solid_id)
    return pickle.loads(solid.shape)

def get_solid_id_map(solid_ids: List[str]) -> Dict[str, TopoDS_Solid]:
    solid_id_map = {}
    for id in solid_ids:
        solid = Solid.objects.get(solid_id=id)
        solid_id_map[id] = pickle.loads(solid.shape)
    return solid_id_map

def save_shape(solid_id_map: Dict[str, TopoDS_Solid]) -> List[str]:
    ids = []
    for solid_id, solid in solid_id_map.items():
        ids.append(solid_id)
        # 如果数据库中不存在该 id 的记录，则创建新的记录
        if not Solid.objects.filter(solid_id=solid_id).exists():
          solid = Solid(solid_id=solid_id, shape=pickle.dumps(solid))
          solid.save()
    return ids

def get_TopoDS_Shape_from_solid_ids(solid_ids: List[str]) -> TopoDS_Shape:
    solid_id_map = get_solid_id_map(solid_ids)
    compound = TopoDS_Compound()
    builder = BRep_Builder()
    builder.MakeCompound(compound)
    for solid in solid_id_map.values():
        builder.Add(compound, solid)
    return compound

def get_TopoDS_Shape_from_solid_id_map(solid_id_map: Dict[str, TopoDS_Solid]) -> TopoDS_Shape:
    compound = TopoDS_Compound()
    builder = BRep_Builder()
    builder.MakeCompound(compound)
    for solid in solid_id_map.values():
        builder.Add(compound, solid)
    return compound

def get_TopoDS_Shape_from_solid(solid: TopoDS_Solid) -> TopoDS_Shape:
    compound = TopoDS_Compound()
    builder = BRep_Builder()
    builder.MakeCompound(compound)
    builder.Add(compound, solid)
    return compound