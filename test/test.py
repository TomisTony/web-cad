# from OCC.Extend.DataExchange import read_step_file

# # 读取 STEP 文件
# step_filename = 'c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\test\\as1-oc-214-mat.stp'
# shape = read_step_file(step_filename)

# # from OCC.Core.TopExp import TopExp_Explorer
# from OCC.Core.TopoDS import TopoDS_Iterator
# from OCC.Core import TopoDS
# from OCC.Core.TopAbs import TopAbs_COMPOUND, TopAbs_COMPSOLID, TopAbs_SOLID, TopAbs_SHELL, TopAbs_FACE, TopAbs_WIRE, TopAbs_EDGE, TopAbs_VERTEX, TopAbs_SHAPE, TopAbs_FORWARD

# topo_lut = {
#     TopAbs_COMPOUND: "COMPOUND",
#     TopAbs_COMPSOLID: "COMPSOLID",
#     TopAbs_SOLID: "SOLID",
#     TopAbs_SHELL: "SHELL",
#     TopAbs_FACE: "FACE",
#     TopAbs_WIRE: "WIRE",
#     TopAbs_EDGE: "EDGE",
#     TopAbs_VERTEX: "VERTEX",
#     TopAbs_SHAPE: "SHAPE"
# }

# def iterate_shape(shape) -> dict:
#     shape_iter = TopoDS_Iterator(shape)
#     shape_dict = {}
#     while shape_iter.More():
#         sub_shape = shape_iter.Value()
#         shape_type = topo_lut[sub_shape.ShapeType()]
#         shape_dict[shape_type] = iterate_shape(sub_shape)
#         shape_iter.Next()
#     return shape_dict

# shape_dict = iterate_shape(shape)
# # 格式化打印
# import json
# print(json.dumps(shape_dict, indent=4, ensure_ascii=False))

from OCC.Core.TCollection import TCollection_ExtendedString

from OCC.Core.TDocStd import TDocStd_Document
from OCC.Core.XCAFDoc import (XCAFDoc_DocumentTool_ShapeTool,
                              XCAFDoc_DocumentTool_ColorTool,
                              XCAFDoc_DocumentTool_LayerTool,
                              XCAFDoc_DocumentTool_MaterialTool)
from OCC.Core.STEPCAFControl import STEPCAFControl_Reader
from OCC.Core.IFSelect import IFSelect_RetDone
from OCC.Core.TDF import TDF_LabelSequence

from OCC.Display.SimpleGui import init_display

filename = 'c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\test\\as1-oc-214-mat.stp'
_shapes = []

# create an handle to a document
doc = TDocStd_Document(TCollection_ExtendedString("pythonocc-doc"))

# Get root assembly
shape_tool = XCAFDoc_DocumentTool_ShapeTool(doc.Main())
l_colors = XCAFDoc_DocumentTool_ColorTool(doc.Main())
l_layers = XCAFDoc_DocumentTool_LayerTool(doc.Main())
l_materials = XCAFDoc_DocumentTool_MaterialTool(doc.Main())

step_reader = STEPCAFControl_Reader()
step_reader.SetColorMode(True)
step_reader.SetLayerMode(True)
step_reader.SetNameMode(True)
step_reader.SetMatMode(True)

status = step_reader.ReadFile(filename)
if status == IFSelect_RetDone:
    step_reader.Transfer(doc)

labels = TDF_LabelSequence()
color_labels = TDF_LabelSequence()

shape_tool.GetFreeShapes(labels)

print("Number of shapes at root :%i" % labels.Length())
for i in range(labels.Length()):
    sub_shapes_labels = TDF_LabelSequence()
    print("Is Assembly :", shape_tool.IsAssembly(labels.Value(i+1)))
    sub_shapes = shape_tool.GetSubShapes(labels.Value(i+1), sub_shapes_labels)
    print("Number of subshapes in the assemly :%i" % sub_shapes_labels.Length())
l_colors.GetColors(color_labels)

print("Number of colors=%i" % color_labels.Length())
for i in range(color_labels.Length()):
    color = color_labels.Value(i+1)

for i in range(labels.Length()):
    label = labels.Value(i+1)
    print(label.Data())
    a_shape = shape_tool.GetShape(label)
    m = l_layers.GetLayers(a_shape)
    _shapes.append(a_shape)

#
# Display
#
display, start_display, add_menu, add_function_to_menu = init_display()
display.DisplayShape(_shapes, update=True)
start_display()
