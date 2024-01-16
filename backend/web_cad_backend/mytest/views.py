from rest_framework.decorators import api_view
from utils.api_response import ApiResponse
from mytest.models import Operation

import pickle

from BrCAD.topoDS_shape_convertor import TopoDSShapeConvertor
from OCC.Core.TopAbs import TopAbs_EDGE, TopAbs_SHAPE
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.BRepFilletAPI import BRepFilletAPI_MakeFillet
    

@api_view(['GET'])
def hello(request):
    return ApiResponse("Hello, world!")

@api_view(['GET'])
def loadModel(request):
    from OCC.Extend.DataExchange import read_step_file
    # 读取 STEP 文件
    step_filename = 'c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\backend\\test\\as1-oc-214-mat.stp'
    shape = read_step_file(step_filename)
    converter = TopoDSShapeConvertor(shape)
    br_cad = converter.get_BrCAD()
    # 保存操作
    operation = Operation(type="load", brcad=br_cad.to_json(), topods_shape=pickle.dumps(shape))
    operation.save()
    
    return ApiResponse({"oprationId": operation.id, "model": br_cad.to_dict()})

@api_view(['GET'])
def loadDiff(request):
    lastOperationId = request.GET.get("lastOperationId")
    last_shape = pickle.loads(Operation.objects.get(id=lastOperationId).topods_shape)
    # 创建一个倒角生成器,并设置倒角半径
    fillet = BRepFilletAPI_MakeFillet(last_shape)
    edge_exp = TopExp_Explorer(last_shape, TopAbs_EDGE, TopAbs_SHAPE)
    while edge_exp.More():
        edge = edge_exp.Current()
        fillet.Add(2.0, edge)
        break
    shape = fillet.Shape()
    converter_1 = TopoDSShapeConvertor(last_shape)
    brcad_1 = converter_1.get_BrCAD()
    converter_2 = TopoDSShapeConvertor(shape)
    brcad_2 = converter_2.get_BrCAD()
    from BrCAD.BrCAD_compare import BrCADCompare
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    
    # 保存操作
    operation = Operation(type="fillet", brcad=brcad_2.to_json(), topods_shape=pickle.dumps(shape))
    operation.save()
    
    return ApiResponse({"oprationId": operation.id, "diff": brcad_compare.get_diff()})
