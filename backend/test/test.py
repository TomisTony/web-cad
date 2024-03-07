# 加上运行路径
import sys
sys.path.append('c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\backend')
sys.path.append('c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\backend\\web_cad_backend')

from OCC.Extend.DataExchange import read_step_file

# 读取 STEP 文件
# step_filename = 'c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\backend\\test\\as1-oc-214-mat.stp'
step_filename = 'c:\\users\\GXLYQ_AIR\\Desktop\\model.step'
shape = read_step_file(step_filename)

from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopAbs import TopAbs_SOLID, TopAbs_SHELL, TopAbs_SHAPE
from web_cad_backend.BrCAD.topoDS_shape_convertor import TopoDSShapeConvertor
from web_cad_backend.BrCAD.BrCAD_compare import BrCADCompare
import json

# # 生成一个立方体
# from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCC.Core.BRepFilletAPI import BRepFilletAPI_MakeFillet

convertor = TopoDSShapeConvertor(shape)
map = convertor.get_id_TopoDS_Shape_map()
br_cad = convertor.get_BrCAD_with_new_structure()
solid_id = br_cad.structure.children[0].id
edge_id = br_cad.edges[0].id
edge = map[edge_id]
fillet = BRepFilletAPI_MakeFillet(shape)
fillet.Add(float(2), edge)
shape_2 = fillet.Shape()
br_cad_2 = TopoDSShapeConvertor(shape_2).get_BrCAD_after_operation(br_cad,"fillet",[solid_id])
compare = BrCADCompare(br_cad, br_cad_2).get_diff()
json_0 = br_cad.to_json()
json_1 = br_cad_2.to_json()
json_2 = json.dumps(compare)
# 保存到同文件夹
with open('c:\\users\\GXLYQ_AIR\\Desktop\\model_origin.json', 'w') as f:
    f.write(json_0)
with open('c:\\users\\GXLYQ_AIR\\Desktop\\model_fillet.json', 'w') as f:
    f.write(json_1)
with open('c:\\users\\GXLYQ_AIR\\Desktop\\model_diff.json', 'w') as f:
    f.write(json_2)
# 展示 shape_2
from OCC.Display.SimpleGui import init_display

display, start_display, add_menu, add_function_to_menu = init_display()
display.DisplayShape(shape_2, update=True)
start_display()


