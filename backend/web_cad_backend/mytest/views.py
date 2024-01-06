from django.http import HttpResponse
from django.http import JsonResponse

from BrCAD.topoDS_shape_convertor import TopoDSShapeConvertor
from OCC.Core.TopAbs import TopAbs_EDGE, TopAbs_SHAPE
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCC.Core.BRepFilletAPI import BRepFilletAPI_MakeFillet

def hello(request):
    return HttpResponse("Hello world ! ")

def loadModel(request):
    # 新建一个长方体
    box = BRepPrimAPI_MakeBox(10., 20., 30.).Shape()
    # 创建一个倒角生成器,并设置倒角半径
    fillet = BRepFilletAPI_MakeFillet(box)
    edge_exp = TopExp_Explorer(box, TopAbs_EDGE, TopAbs_SHAPE)
    while edge_exp.More():
        edge = edge_exp.Current()
        fillet.Add(2.0, edge)
        break
    converter = TopoDSShapeConvertor(box)
    br_cad = converter.get_BrCAD()
    return JsonResponse(br_cad.to_dict())

def loadDiff(request):
    # 新建一个长方体
    box = BRepPrimAPI_MakeBox(10., 20., 30.).Shape()
    # 创建一个倒角生成器,并设置倒角半径
    fillet = BRepFilletAPI_MakeFillet(box)
    edge_exp = TopExp_Explorer(box, TopAbs_EDGE, TopAbs_SHAPE)
    while edge_exp.More():
        edge = edge_exp.Current()
        fillet.Add(2.0, edge)
        break
    shape = fillet.Shape()
    converter_1 = TopoDSShapeConvertor(box)
    br_cad_1 = converter_1.get_BrCAD()
    converter_2 = TopoDSShapeConvertor(shape)
    br_cad_2 = converter_2.get_BrCAD()
    from BrCAD.BrCAD_compare import BrCADCompare
    br_cad_compare = BrCADCompare(br_cad_1, br_cad_2)
    return JsonResponse(br_cad_compare.get_diff())
