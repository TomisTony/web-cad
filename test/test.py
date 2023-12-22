from OCC.Extend.DataExchange import read_step_file

# 读取 STEP 文件
step_filename = 'c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\test\\as1-oc-214-mat.stp'
shape = read_step_file(step_filename)

# from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopoDS import TopoDS_Iterator
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.BRep import BRep_Tool
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core import TopoDS
from OCC.Core.TopAbs import TopAbs_COMPOUND, TopAbs_COMPSOLID, TopAbs_SOLID, TopAbs_SHELL, TopAbs_FACE, TopAbs_WIRE, TopAbs_EDGE, TopAbs_VERTEX, TopAbs_SHAPE, TopAbs_FORWARD

# old_face_hashes = {}
# BRepMesh_IncrementalMesh(shape, 0.1, False, 0.5, False)
# exp = TopExp_Explorer(shape, TopAbs_FACE, TopAbs_SHAPE)
# while exp.More():
#     face = exp.Current()
#     hash = face.HashCode(100000000)
#     aloc = TopLoc_Location()
#     bt = BRep_Tool()
#     myT = bt.Triangulation(face, aloc)
#     print(myT)
#     if hash not in old_face_hashes:
#         old_face_hashes[hash] = face
#     exp.Next()
    
# BRepMesh_IncrementalMesh(shape, 0.1, False, 0.5, False)

# new_face_hashes = {}
# exp2 = TopExp_Explorer(shape, TopAbs_FACE, TopAbs_SHAPE)
# while exp2.More():
#     face = exp2.Current()
#     hash = face.HashCode(100000000)
#     if hash not in new_face_hashes:
#         new_face_hashes[hash] = face
#     exp2.Next()
    
# print(len(old_face_hashes))
# print(len(new_face_hashes))
# print(len(old_face_hashes) - len(new_face_hashes))
import sys
sys.path.insert(0, 'C:/USERS/GXLYQ_AIR/DESKTOP/WEB-CAD')
from BrCAD import TopoDSShapeConvertor
converter = TopoDSShapeConvertor.TopoDSShapeConvertor(shape)
print(converter.get_BrCAD().to_json("output.json"))



