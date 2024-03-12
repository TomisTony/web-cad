from rest_framework.decorators import api_view
from rest_framework import status
from utils.api_response import ApiResponse
from cad.models import Operation
from cad.models import Project
from django.conf import settings
from django.http import HttpRequest, FileResponse

from cad.views.channels_views import notify_update_history_list

import pickle
import os
import time
import json

from BrCAD.topoDS_shape_convertor import TopoDSShapeConvertor
from BrCAD.BrCAD_compare import BrCADCompare
from BrCAD.BrCAD import BrCAD

from OCC.Core.TopoDS import TopoDS_Shape, TopoDS_Compound
from OCC.Core.BRepFilletAPI import BRepFilletAPI_MakeFillet
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Core.BRep import BRep_Builder
from OCC.Core.gp import gp_Pnt, gp_Trsf, gp_Vec, gp_Ax1, gp_Dir, gp_Quaternion
from OCC.Extend.DataExchange import read_step_file
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_StepModelType
from OCC.Extend.DataExchange import write_stl_file

# 获得指定 Operation 的模型
@api_view(["GET"])
def getOperationModel(request: HttpRequest):
    operation_id = request.GET.get("operationId")
    operation = Operation.objects.get(id=operation_id)
    brcad: BrCAD = pickle.loads(operation.brcad)
    return ApiResponse({"model": brcad.to_dict()})

# Operation "Import"
@api_view(["POST"])
def uploadFile(request: HttpRequest, project_id: int, operator_id: int):
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
        br_cad = converter.get_BrCAD_with_new_structure()
        # 保存操作
        operation = Operation(
            type="Import",
            project_id=project_id,
            operator_id=int(operator_id),
            time=int(time.time() * 1000),
            brcad=pickle.dumps(br_cad),
            topods_shape=pickle.dumps(shape),
        )
        operation.save()
        # 更新 project 的 operation_history_ids
        project = Project.objects.get(id=project_id)
        project.operation_history_ids.append(operation.id)
        project.save()
        # 通知前端更新历史记录
        notify_update_history_list(project_id)
        # 删除文件
        os.remove(filename)
        return ApiResponse({"operationId": operation.id, "model": br_cad.to_dict()})
    except Exception as e:
        # 先查看文件是否已经保存下来了,如果保存下来了,则删除
        print(e)
        if os.path.exists(filename):
            os.remove(filename)
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Operation "Export" - not History
@api_view(["GET"])
def downloadFile(request: HttpRequest):
    # 在 media 新建一个 timestamp 命名的文件夹
    timestamp = str(int(time.time()))
    os.makedirs(os.path.join(settings.MEDIA_ROOT, timestamp), exist_ok=True)
    try:
        lastOperationId = request.GET.get("lastOperationId")
        fileFormat = request.GET.get("fileFormat")
        last_shape = pickle.loads(
            Operation.objects.get(id=lastOperationId).topods_shape
        )
        # 一个存储文件后缀名和对应 MIME 类型的字典
        MIME_TYPES = {
            ".step": "application/vnd.ms-pki.stl",
            ".stl": "application/vnd.ms-pki.stl",
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
        file = open(filename, "rb")
        response = FileResponse(file)
        response["Content-Type"] = MIME_TYPES[fileFormat]
        response["Content-Disposition"] = f'attachment;filename="model{fileFormat}"'
    except Exception as e:
        response = ApiResponse(
            "server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response


# Operation "Fillet"
@api_view(["POST"])
def fillet(request: HttpRequest):
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    choosed_id_list = data.get("choosedIdList")
    related_solid_id_list = data.get("relatedSolidIdList")
    choosedId = choosed_id_list[0]
    props = data.get("props")
    radius = props.get("radius")
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    last_shape = pickle.loads(Operation.objects.get(id=last_operation_id).topods_shape)
    converter_1 = TopoDSShapeConvertor(last_shape)
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    id_map = converter_1.get_id_TopoDS_Shape_map()
    # step3: 执行对应操作
    # 创建一个倒角生成器,并设置倒角半径
    fillet = BRepFilletAPI_MakeFillet(last_shape)
    fillet.Add(float(radius), id_map[choosedId])
    shape = fillet.Shape()
    # step4: 生成新的 BrCAD 对象进行比较
    converter_2 = TopoDSShapeConvertor(shape)
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Fillet", related_solid_id_list, True)
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    operation = Operation(
        type="Fillet",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        topods_shape=pickle.dumps(shape),
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    project = Project.objects.get(id=project_id)
    project.operation_history_ids.append(operation.id)
    project.save()
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)

    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Rename"
@api_view(["POST"])
def rename(request: HttpRequest):
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    choosed_id_list = data.get("choosedIdList")
    related_solid_id_list = data.get("relatedSolidIdList")
    choosedId = choosed_id_list[0]
    props = data.get("props")
    new_name = props.get("name")
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    last_shape = pickle.loads(Operation.objects.get(id=last_operation_id).topods_shape)
    converter_1 = TopoDSShapeConvertor(last_shape)
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    id_map = converter_1.get_id_TopoDS_Shape_map()
    # step3: 执行对应操作
    # 重命名
    brcad_2: BrCAD = pickle.loads(pickle.dumps(brcad_1))
    for node in brcad_2.structure.children:
        if node.id == choosedId:
            node.label = new_name
            break
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    operation = Operation(
        type="Rename",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        topods_shape=pickle.dumps(last_shape),
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    project = Project.objects.get(id=project_id)
    project.operation_history_ids.append(operation.id)
    project.save()
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)

    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Transform"
@api_view(["POST"])
def transform(request: HttpRequest):
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    choosed_id_list = data.get("choosedIdList")
    related_solid_id_list = data.get("relatedSolidIdList")
    choosedId = choosed_id_list[0]
    props = data.get("props")
    move_x = props.get("moveX")
    move_y = props.get("moveY")
    move_z = props.get("moveZ")
    rotate_x = props.get("rotateX")
    rotate_y = props.get("rotateY")
    rotate_z = props.get("rotateZ")
    scale = props.get("scale")
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    last_shape: TopoDS_Shape = pickle.loads(Operation.objects.get(id=last_operation_id).topods_shape)
    converter_1 = TopoDSShapeConvertor(last_shape)
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid_map = converter_1.get_id_solid_map()
    # step3: 执行对应操作
    T_translate = gp_Trsf()
    T_rotate_x = gp_Trsf()
    T_rotate_y = gp_Trsf()
    T_rotate_z = gp_Trsf()
    T_scale = gp_Trsf()
    T_translate.SetTranslation(gp_Vec(float(move_x), float(move_y), float(move_z)))
    T_rotate_x.SetRotation(gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(1, 0, 0)), float(rotate_x))
    T_rotate_y.SetRotation(gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(0, 1, 0)), float(rotate_y))
    T_rotate_z.SetRotation(gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(0, 0, 1)), float(rotate_z))
    T_scale.SetScaleFactor(float(scale))
    # 整合变换
    T_final = gp_Trsf()
    T_final.Multiply(T_translate)
    T_final.Multiply(T_rotate_x)
    T_final.Multiply(T_rotate_y)
    T_final.Multiply(T_rotate_z)
    T_final.Multiply(T_scale)
    shape = TopoDS_Compound()
    builder = BRep_Builder()
    builder.MakeCompound(shape)
    for solid_id, solid in solid_map.items():
        if solid_id == choosedId:
            print("111")
            new_solid = BRepBuilderAPI_Transform(solid, T_final).Shape()
        else:
            new_solid = solid
        builder.Add(shape, new_solid)
    # step4: 生成新的 BrCAD 对象进行比较
    converter_2 = TopoDSShapeConvertor(shape)
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Transform", related_solid_id_list, True)
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    operation = Operation(
        type="Transform",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        topods_shape=pickle.dumps(shape),
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    project = Project.objects.get(id=project_id)
    project.operation_history_ids.append(operation.id)
    project.save()
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})
    

# Operation "Rollback"
@api_view(["POST"])
def rollback_with_concatenation_mode(request: HttpRequest):
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    rollback_operation_id = props.get("rollbackId")
    # step2: 获取上一步的 BrCAD 对象
    # step3: 执行对应操作
    rollback_shape = pickle.loads(Operation.objects.get(id=rollback_operation_id).topods_shape)
    rollback_brcad = pickle.loads(Operation.objects.get(id=rollback_operation_id).brcad)
    # step4: Rollback 操作比较特殊，我们不知道 related_solid_id_list，因此我们直接回传完整的 BrCAD 对象
    # 本质上和 Transfer 是一样的
    # step5: 保存操作
    operation = Operation(
        type="Rollback",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(rollback_brcad),
        topods_shape=pickle.dumps(rollback_shape),
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    project = Project.objects.get(id=project_id)
    project.operation_history_ids.append(operation.id)
    project.save()
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "model": rollback_brcad.to_dict()})
    
