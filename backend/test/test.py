from OCC.Extend.DataExchange import read_step_file

# 读取 STEP 文件
step_filename = 'c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\backend\\test\\as1-oc-214-mat.stp'
shape = read_step_file(step_filename)

# from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopoDS import TopoDS_Iterator
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Core.BRep import BRep_Tool
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core import TopoDS
from OCC.Core.TopAbs import TopAbs_COMPOUND, TopAbs_COMPSOLID, TopAbs_SOLID, TopAbs_SHELL, TopAbs_FACE, TopAbs_WIRE, TopAbs_EDGE, TopAbs_VERTEX, TopAbs_SHAPE, TopAbs_FORWARD

# # 新建一个长方体
# from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
# box = BRepPrimAPI_MakeBox(10., 20., 30.).Shape()
# # 创建一个倒角生成器,并设置倒角半径
# from OCC.Core.BRepFilletAPI import BRepFilletAPI_MakeFillet
# fillet = BRepFilletAPI_MakeFillet(box)

# edge_exp = TopExp_Explorer(box, TopAbs_EDGE, TopAbs_SHAPE)
# while edge_exp.More():
#     edge = edge_exp.Current()
#     fillet.Add(2.0, edge)
#     break

# # 建立倒角后的形状
# shape = fillet.Shape()

# from OCC.Display.SimpleGui import init_display

# display, start_display, add_menu, add_function_to_menu = init_display()

# # 假设你的模型是 filleted_box
# display.DisplayShape(shape, update=True)

# # 启动渲染循环
# start_display()

import sys
sys.path.insert(0, 'C:/USERS/GXLYQ_AIR/DESKTOP/WEB-CAD/BACKEND')
from BrCAD.TopoDSShapeConvertor import TopoDSShapeConvertor
converter = TopoDSShapeConvertor(shape)
converter.get_BrCAD().to_json("output.json")



