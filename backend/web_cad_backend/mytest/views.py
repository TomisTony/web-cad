from rest_framework.decorators import api_view
from rest_framework import status
from utils.api_response import ApiResponse
from mytest.models import Operation
from django.conf import settings
from django.http import HttpRequest, FileResponse

import pickle
import os
import time

from BrCAD.topoDS_shape_convertor import TopoDSShapeConvertor
from OCC.Core.TopAbs import TopAbs_EDGE, TopAbs_SHAPE
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.BRepFilletAPI import BRepFilletAPI_MakeFillet
from OCC.Extend.DataExchange import read_step_file
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_StepModelType
from OCC.Extend.DataExchange import write_stl_file
    

@api_view(['GET'])
def hello(request):
    return ApiResponse("Hello, world!")

@api_view(['POST'])
def uploadFile(request: HttpRequest):
    file = request.FILES.get("file", None)
    if file is None:
        return ApiResponse("No file is uploaded", data_status=400)
    filename = os.path.join(settings.MEDIA_ROOT, file.name)
    
    try:     
      # 确保文件夹存在
      os.makedirs(os.path.join(settings.MEDIA_ROOT), exist_ok=True)
      with open(os.path.join(settings.MEDIA_ROOT, file.name), "wb") as f:
          for chunk in file.chunks():
              f.write(chunk)
      # 读取文件
      shape = read_step_file(filename)
      converter = TopoDSShapeConvertor(shape)
      br_cad = converter.get_BrCAD()
      # 保存操作
      operation = Operation(type="import", brcad=br_cad.to_json(), topods_shape=pickle.dumps(shape))
      operation.save()
      # 删除文件
      os.remove(filename)
      return ApiResponse({"oprationId": operation.id, "model": br_cad.to_dict()})
    except Exception as e:
      # 先查看文件是否已经保存下来了,如果保存下来了,则删除
      if os.path.exists(filename):
          os.remove(filename)
      return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def downloadFile(request: HttpRequest):
    # 在 media 新建一个 timestamp 命名的文件夹
    timestamp = str(int(time.time()))
    os.makedirs(os.path.join(settings.MEDIA_ROOT, timestamp), exist_ok=True)
    try:
      lastOperationId = request.GET.get("lastOperationId")
      fileFormat = request.GET.get("fileFormat")
      last_shape = pickle.loads(Operation.objects.get(id=lastOperationId).topods_shape)
      # 一个存储文件后缀名和对应 MIME 类型的字典
      MIME_TYPES = {
          '.step': 'application/vnd.ms-pki.stl',
          '.stl': 'application/vnd.ms-pki.stl',
      }
      # 保存文件
      filename = os.path.join(settings.MEDIA_ROOT, timestamp, f"model{fileFormat}")
      if fileFormat == ".step":
          step_writer = STEPControl_Writer()
          step_writer.Transfer(last_shape, STEPControl_StepModelType.STEPControl_AsIs)
          step_writer.Write(filename)
      elif fileFormat == ".stl":
          write_stl_file(last_shape, filename)
      # 传递文件给前端
      file = open(filename, 'rb')
      response = FileResponse(file)
      response['Content-Type'] = MIME_TYPES[fileFormat]
      response['Content-Disposition'] = f'attachment;filename="model{fileFormat}"'
    except Exception as e:
      response = ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response

@api_view(['GET'])
def fillet(request: HttpRequest):
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
