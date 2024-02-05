# from OCC.Extend.DataExchange import read_step_file

# # 读取 STEP 文件
# step_filename = 'c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\backend\\test\\as1-oc-214-mat.stp'
# shape = read_step_file(step_filename)

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

filename = 'c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\backend\\test\\as1-oc-214-mat.stp'
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
    print("Is Component :", shape_tool.IsComponent(labels.Value(i+1)))
    print(shape_tool.NbComponents(labels.Value(i+1)))
    sub_shapes = shape_tool.GetSubShapes(labels.Value(i+1), sub_shapes_labels)
    print("Number of subshapes in the assemly :%i" % sub_shapes_labels.Length())

