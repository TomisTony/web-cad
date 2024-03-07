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

convertor = TopoDSShapeConvertor(shape)
br_cad = convertor.get_BrCAD_with_new_structure()
json = br_cad.to_json()
# 保存到同文件夹
with open('c:\\users\\GXLYQ_AIR\\Desktop\\model.json', 'w') as f:
    f.write(json)

