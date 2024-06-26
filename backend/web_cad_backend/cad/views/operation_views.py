from rest_framework.decorators import api_view
from rest_framework import status
from utils.api_response import ApiResponse
from cad.models import Operation
from cad.models import Project
from django.conf import settings
from django.http import HttpRequest, FileResponse
from django.db import transaction, DatabaseError

from cad.views.channels_views import notify_update_history_list

import pickle
import os
import time
import json
import uuid

from BrCAD.topoDS_shape_convertor import TopoDSShapeConvertor
from BrCAD.BrCAD_compare import BrCADCompare
from BrCAD.BrCAD import BrCAD, BrCAD_node

from utils.solid_tool import get_TopoDS_Shape_from_solid, get_solid_by_id, get_solid_id_map, save_shape, get_TopoDS_Shape_from_solid_ids, get_TopoDS_Shape_from_solid_id_map

from OCC.Core.TopoDS import TopoDS_Shape, TopoDS_Compound
from OCC.Core.BRepFilletAPI import BRepFilletAPI_MakeFillet, BRepFilletAPI_MakeChamfer
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox, BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakeSphere, BRepPrimAPI_MakeTorus, BRepPrimAPI_MakeCone
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Cut, BRepAlgoAPI_Fuse,BRepAlgoAPI_Common
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Core.BRep import BRep_Builder
from OCC.Core.gp import gp_Pnt, gp_Trsf, gp_Vec, gp_Ax1, gp_Dir
from OCC.Extend.DataExchange import read_step_file, read_iges_file, read_stl_file
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_StepModelType
from OCC.Extend.DataExchange import write_stl_file, write_iges_file

def is_last_operation(operation_id:str, project_id:int):
    project = Project.objects.get(id=project_id)
    if len(project.operation_history_ids) == 0:
        return True
    true_last_operation_id = project.operation_history_ids[-1]
    return operation_id == true_last_operation_id

# 获得指定 Operation 的模型
@api_view(["GET"])
def getOperationModel(request: HttpRequest):
    operation_id = request.GET.get("operationId")
    operation = Operation.objects.get(id=operation_id)
    brcad: BrCAD = pickle.loads(operation.brcad)
    return ApiResponse({"model": brcad.to_dict()})

# Operation "Import"
@api_view(["POST"])
def uploadFile(request: HttpRequest, project_id: int, operator_id: int, last_operation_id: str):
    last_operation_id = int(last_operation_id)
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
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
        # 根据后缀名选择读取的方法
        shape = None
        if file.name.lower().endswith(".stl"):
            shape = read_stl_file(filename)
        elif file.name.lower().endswith(".step") or file.name.lower().endswith(".stp"): 
            shape = read_step_file(filename)
        elif file.name.lower().endswith(".iges") or file.name.lower().endswith(".igs"):
            shape = read_iges_file(filename)
        # 分两种情况,如果是空项目,则直接返回 BrCAD 对象,否则返回操作后的 BrCAD 对象
        if last_operation_id == -1:
            converter = TopoDSShapeConvertor(shape)
            br_cad = converter.get_BrCAD_with_new_structure()
            solid_id_map = converter.get_id_solid_map()
            # 保存操作
            solid_ids = save_shape(solid_id_map)
            operation = Operation(
                type="Import",
                project_id=project_id,
                operator_id=int(operator_id),
                time=int(time.time() * 1000),
                brcad=pickle.dumps(br_cad),
                solid_ids=solid_ids,
            )
            operation.save()
            # 更新 project 的 operation_history_ids
            try:
              with transaction.atomic():
                project = Project.objects.select_for_update().get(id=project_id)
                if not is_last_operation(last_operation_id, project_id):
                    operation.delete()
                    return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
                project.operation_history_ids.append(operation.id)
                project.save()
            except Exception as e:
                return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
            # 通知前端更新历史记录
            notify_update_history_list(project_id)
            # 删除文件
            os.remove(filename)
            return ApiResponse({"operationId": operation.id, "model": br_cad.to_dict()})
        else:
            solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
            brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
            converter = TopoDSShapeConvertor(shape)
            new_solid_id_map = converter.get_id_solid_map()
            for solid_id, solid in new_solid_id_map.items():
                solid_map[solid_id] = solid
            brcad_2 = BrCAD.union(brcad_1, converter.get_BrCAD_with_new_structure())
            brcad_compare = BrCADCompare(brcad_1, brcad_2)
            solid_ids = save_shape(solid_map)
            operation = Operation(
                type="Import",
                project_id=project_id,
                operator_id=int(operator_id),
                time=int(time.time() * 1000),
                brcad=pickle.dumps(brcad_2),
                solid_ids=solid_ids,
            )
            operation.save()
            # 更新 project 的 operation_history_ids
            try:
              with transaction.atomic():
                project = Project.objects.select_for_update().get(id=project_id)
                if not is_last_operation(last_operation_id, project_id):
                    operation.delete()
                    return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
                project.operation_history_ids.append(operation.id)
                project.save()
            except Exception as e:
                return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
            # 通知前端更新历史记录
            notify_update_history_list(project_id)
            # 删除文件
            os.remove(filename)
            return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})
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
        last_shape = get_TopoDS_Shape_from_solid_ids(Operation.objects.get(id=lastOperationId).solid_ids)
        # 一个存储文件后缀名和对应 MIME 类型的字典
        MIME_TYPES = {
            ".step": "application/vnd.ms-pki.stl",
            ".stl": "application/vnd.ms-pki.stl",
            ".iges": "application/vnd.ms-pki.stl",
        }
        # 保存文件
        filename = os.path.join(settings.MEDIA_ROOT, timestamp, f"model{fileFormat}")
        if fileFormat == ".step":
            step_writer = STEPControl_Writer()
            step_writer.Transfer(last_shape, STEPControl_StepModelType.STEPControl_AsIs)
            step_writer.Write(filename)
        elif fileFormat == ".stl":
            write_stl_file(last_shape, filename)
        elif fileFormat == ".iges":
            write_iges_file(last_shape, filename)
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
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    brcad_1_pickle = Operation.objects.get(id=last_operation_id).brcad
    brcad_1: BrCAD = pickle.loads(brcad_1_pickle)
    solid_id_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    target_solid = solid_id_map[related_solid_id_list[0]]
    # 获得更改的 solid 的 对应的 face 和 edge 的 id map
    converter_1 = TopoDSShapeConvertor(target_solid)
    id_map = converter_1.get_id_TopoDS_Shape_map()
    # step3: 执行对应操作
    # 创建一个倒角生成器,并设置倒角半径
    fillet = BRepFilletAPI_MakeFillet(target_solid)
    fillet.Add(float(radius), id_map[choosedId])
    new_solid = fillet.Shape()
    new_solid_id = uuid.uuid1().hex
    solid_id_map[new_solid_id] = new_solid
    solid_id_map.pop(related_solid_id_list[0])
    # step4: 生成新的 BrCAD 对象进行比较
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_id_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Fillet",new_solid_id, related_solid_id_list, True)
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    solid_ids = save_shape(solid_id_map)
    operation = Operation(
        type="Fillet",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Chamfer"
@api_view(["POST"])
def chamfer(request: HttpRequest):
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
    length = props.get("length")
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid_id_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    target_solid = solid_id_map[related_solid_id_list[0]]
    # 获得更改的 solid 的 对应的 face 和 edge 的 id map
    converter_1 = TopoDSShapeConvertor(target_solid)
    id_map = converter_1.get_id_TopoDS_Shape_map()
    # step3: 执行对应操作
    # 创建一个倒角生成器,并设置倒角半径
    chamfer = BRepFilletAPI_MakeChamfer(target_solid)
    chamfer.Add(float(length), id_map[choosedId])
    new_solid = chamfer.Shape()
    new_solid_id = uuid.uuid1().hex
    solid_id_map[new_solid_id] = new_solid
    solid_id_map.pop(related_solid_id_list[0])
    # step4: 生成新的 BrCAD 对象进行比较
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_id_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Chamfer",new_solid_id, related_solid_id_list, True)
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    solid_ids = save_shape(solid_id_map)
    operation = Operation(
        type="Chamfer",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
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
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
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
        solid_ids=Operation.objects.get(id=last_operation_id).solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
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
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    # step3: 执行对应操作
    T_translate = gp_Trsf()
    T_rotate_x = gp_Trsf()
    T_rotate_y = gp_Trsf()
    T_rotate_z = gp_Trsf()
    T_scale = gp_Trsf()
    T_translate.SetTranslation(gp_Vec(float(move_x), float(move_y), float(move_z)))
    PI = 3.14159265358979323846
    T_rotate_x.SetRotation(gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(1, 0, 0)), float(rotate_x) * PI / 180)
    T_rotate_y.SetRotation(gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(0, 1, 0)), float(rotate_y) * PI / 180)
    T_rotate_z.SetRotation(gp_Ax1(gp_Pnt(0, 0, 0), gp_Dir(0, 0, 1)), float(rotate_z) * PI / 180)
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
            new_solid = BRepBuilderAPI_Transform(solid, T_final).Shape()
            builder.Add(shape, new_solid)
        else:
            builder.Add(shape, solid)
    new_solid_id = uuid.uuid1().hex
    solid_map.pop(choosedId)
    solid_map[new_solid_id] = new_solid
    # step4: 生成新的 BrCAD 对象进行比较
    converter_2 = TopoDSShapeConvertor(shape)
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Transform",new_solid_id, related_solid_id_list, True)
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Transform",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Delete"
@api_view(["POST"])
def deleteSolid(request: HttpRequest):
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    choosed_id_list = data.get("choosedIdList")
    related_solid_id_list = data.get("relatedSolidIdList")
    choosedId = choosed_id_list[0]
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    # step3: 执行对应操作
    solid_map.pop(choosedId)
    # step4: 生成新的 BrCAD 对象进行比较
    brcad_2: BrCAD = pickle.loads(pickle.dumps(brcad_1))
    delete_node: BrCAD_node = None
    for node in brcad_2.structure.children:
        if node.id == choosedId:
            delete_node = node
            break
    # 删除 face 和 edge
    if delete_node is not None:
        for face_id in delete_node.faces:
            for face in brcad_2.faces:
                if face.id == face_id:
                    brcad_2.faces.remove(face)
                    break
        for edge_id in delete_node.edges:
            for edge in brcad_2.edges:
                if edge.id == edge_id:
                    brcad_2.edges.remove(edge)
                    break
        brcad_2.structure.children.remove(delete_node) 
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Delete",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Box"
@api_view(["POST"])
def makeBox(request: HttpRequest):
    # 新建物体的操作和其他操作不同,因为新建物体的时候需要特判是不是空项目
    # 其他操作在空项目的时候，前端会进行拦截（因为没法选中 topo）
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    x = props.get("x")
    y = props.get("y")
    z = props.get("z")
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    if last_operation_id == -1:
        # 如果是空项目，直接新建一个物体，传完整 BrCAD 对象
        solid = BRepPrimAPI_MakeBox(float(x), float(y), float(z)).Shape()
        converter = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid(solid))
        brcad = converter.get_BrCAD_with_new_structure()
        solid_map = converter.get_id_solid_map()
        solid_ids = save_shape(solid_map)
        operation = Operation(
            type="Box",
            project_id=project_id,
            operator_id=int(operator_id),
            time=int(time.time() * 1000),
            data=data,
            brcad=pickle.dumps(brcad),
            solid_ids=solid_ids,
        )
        operation.save()
        #更新 project 的 operation_history_ids
        project = Project.objects.get(id=project_id)
        project.operation_history_ids.append(operation.id)
        project.save()
        #通知前端更新历史记录
        notify_update_history_list(project_id)
        
        return ApiResponse({"operationId": operation.id, "model": brcad.to_dict()})
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid = BRepPrimAPI_MakeBox(float(x), float(y), float(z)).Shape()
    new_solid_id = uuid.uuid1().hex
    solid_map[new_solid_id] = solid
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Box",new_solid_id, [])
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Box",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    #更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    #通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Cylinder"
@api_view(["POST"])
def makeCylinder(request: HttpRequest):
    # 新建物体的操作和其他操作不同,因为新建物体的时候需要特判是不是空项目
    # 其他操作在空项目的时候，前端会进行拦截（因为没法选中 topo）
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    radius = props.get("radius")
    height = props.get("height")
    angle = props.get("angle")
    PI = 3.14159265358979323846
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    if last_operation_id == -1:
        # 如果是空项目，直接新建一个物体，传完整 BrCAD 对象
        solid = BRepPrimAPI_MakeCylinder(float(radius), float(height), float(angle) * PI / 180).Shape()
        converter = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid(solid))
        brcad = converter.get_BrCAD_with_new_structure()
        solid_map = converter.get_id_solid_map()
        solid_ids = save_shape(solid_map)
        operation = Operation(
            type="Cylinder",
            project_id=project_id,
            operator_id=int(operator_id),
            time=int(time.time() * 1000),
            data=data,
            brcad=pickle.dumps(brcad),
            solid_ids=solid_ids,
        )
        operation.save()
        #更新 project 的 operation_history_ids
        project = Project.objects.get(id=project_id)
        project.operation_history_ids.append(operation.id)
        project.save()
        #通知前端更新历史记录
        notify_update_history_list(project_id)
        
        return ApiResponse({"operationId": operation.id, "model": brcad.to_dict()})
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid = BRepPrimAPI_MakeCylinder(float(radius), float(height), float(angle) * PI / 180).Shape()
    new_solid_id = uuid.uuid1().hex
    solid_map[new_solid_id] = solid
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Cylinder",new_solid_id, [])
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Cylinder",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    #更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    #通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()}) 

# Operation "Sphere"
@api_view(["POST"])
def makeSphere(request: HttpRequest):
    # 新建物体的操作和其他操作不同,因为新建物体的时候需要特判是不是空项目
    # 其他操作在空项目的时候，前端会进行拦截（因为没法选中 topo）
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    radius = props.get("radius")
    angle = props.get("angle")
    PI = 3.14159265358979323846
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    if last_operation_id == -1:
        # 如果是空项目，直接新建一个物体，传完整 BrCAD 对象
        solid = BRepPrimAPI_MakeSphere(float(radius), float(angle) * PI / 180).Shape()
        converter = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid(solid))
        brcad = converter.get_BrCAD_with_new_structure()
        solid_map = converter.get_id_solid_map()
        solid_ids = save_shape(solid_map)
        operation = Operation(
            type="Sphere",
            project_id=project_id,
            operator_id=int(operator_id),
            time=int(time.time() * 1000),
            data=data,
            brcad=pickle.dumps(brcad),
            solid_ids=solid_ids,
        )
        operation.save()
        #更新 project 的 operation_history_ids
        project = Project.objects.get(id=project_id)
        project.operation_history_ids.append(operation.id)
        project.save()
        #通知前端更新历史记录
        notify_update_history_list(project_id)
        
        return ApiResponse({"operationId": operation.id, "model": brcad.to_dict()})
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid = BRepPrimAPI_MakeSphere(float(radius), float(angle) * PI / 180).Shape()
    new_solid_id = uuid.uuid1().hex
    solid_map[new_solid_id] = solid
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Sphere",new_solid_id, [])
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Sphere",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    #更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    #通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()}) 

# Operation "Cone"
@api_view(["POST"])
def makeCone(request: HttpRequest):
    # 新建物体的操作和其他操作不同,因为新建物体的时候需要特判是不是空项目
    # 其他操作在空项目的时候，前端会进行拦截（因为没法选中 topo）
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    radius_1 = props.get("radius1")
    radius_2 = props.get("radius2")
    height = props.get("height")
    PI = 3.14159265358979323846
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    if last_operation_id == -1:
        # 如果是空项目，直接新建一个物体，传完整 BrCAD 对象
        solid = BRepPrimAPI_MakeCone(float(radius_1), float(radius_2), float(height)).Shape()
        converter = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid(solid))
        brcad = converter.get_BrCAD_with_new_structure()
        solid_map = converter.get_id_solid_map()
        solid_ids = save_shape(solid_map)
        operation = Operation(
            type="Cone",
            project_id=project_id,
            operator_id=int(operator_id),
            time=int(time.time() * 1000),
            data=data,
            brcad=pickle.dumps(brcad),
            solid_ids=solid_ids,
        )
        operation.save()
        #更新 project 的 operation_history_ids
        project = Project.objects.get(id=project_id)
        project.operation_history_ids.append(operation.id)
        project.save()
        #通知前端更新历史记录
        notify_update_history_list(project_id)
        
        return ApiResponse({"operationId": operation.id, "model": brcad.to_dict()})
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid = BRepPrimAPI_MakeCone(float(radius_1), float(radius_2), float(height)).Shape()
    new_solid_id = uuid.uuid1().hex
    solid_map[new_solid_id] = solid
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Cone",new_solid_id, [])
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Cone",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    #更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    #通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Torus"
@api_view(["POST"])
def makeTorus(request: HttpRequest):
    # 新建物体的操作和其他操作不同,因为新建物体的时候需要特判是不是空项目
    # 其他操作在空项目的时候，前端会进行拦截（因为没法选中 topo）
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    radius_1 = props.get("radius1")
    radius_2 = props.get("radius2")
    angle = props.get("angle")
    PI = 3.14159265358979323846
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    if last_operation_id == -1:
        # 如果是空项目，直接新建一个物体，传完整 BrCAD 对象
        solid = BRepPrimAPI_MakeTorus(float(radius_1), float(radius_2), float(angle) * PI / 180).Shape()
        converter = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid(solid))
        brcad = converter.get_BrCAD_with_new_structure()
        solid_map = converter.get_id_solid_map()
        solid_ids = save_shape(solid_map)
        operation = Operation(
            type="Torus",
            project_id=project_id,
            operator_id=int(operator_id),
            time=int(time.time() * 1000),
            data=data,
            brcad=pickle.dumps(brcad),
            solid_ids=solid_ids,
        )
        operation.save()
        #更新 project 的 operation_history_ids
        project = Project.objects.get(id=project_id)
        project.operation_history_ids.append(operation.id)
        project.save()
        #通知前端更新历史记录
        notify_update_history_list(project_id)
        
        return ApiResponse({"operationId": operation.id, "model": brcad.to_dict()})
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid = BRepPrimAPI_MakeTorus(float(radius_1), float(radius_2), float(angle) * PI / 180).Shape()
    new_solid_id = uuid.uuid1().hex
    solid_map[new_solid_id] = solid
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "Torus",new_solid_id, [])
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Torus",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    #更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    #通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Boolean"
@api_view(["POST"])
def boolean(request: HttpRequest):
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    operation_type = props.get("type")
    solid_1 = props.get("solid1")
    solid_2 = props.get("solid2")
    related_solid_id_list = data.get("relatedSolidIdList")
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    solid_1 = solid_map[related_solid_id_list[0]]
    solid_2 = solid_map[related_solid_id_list[1]]
    solid: TopoDS_Shape = None
    # step3: 执行对应操作
    if operation_type == "union":
        solid = BRepAlgoAPI_Fuse(solid_1, solid_2).Shape()
    elif operation_type == "difference":
        solid = BRepAlgoAPI_Cut(solid_1, solid_2).Shape()
    elif operation_type == "intersection":
        solid = BRepAlgoAPI_Common(solid_1, solid_2).Shape()
    new_solid_id = uuid.uuid1().hex
    solid_map[new_solid_id] = solid
    solid_map.pop(related_solid_id_list[0])
    solid_map.pop(related_solid_id_list[1])
    # step4: 生成新的 BrCAD 对象进行比较
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, operation_type, new_solid_id, related_solid_id_list, False)
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Boolean",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Union"
@api_view(["POST"])
def union(request: HttpRequest):
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    solid_1 = props.get("solid1")
    solid_2 = props.get("solid2")
    related_solid_id_list = data.get("relatedSolidIdList")
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    solid_1 = solid_map[related_solid_id_list[0]]
    solid_2 = solid_map[related_solid_id_list[1]]
    solid = BRepAlgoAPI_Fuse(solid_1, solid_2).Shape()
    new_solid_id = uuid.uuid1().hex
    solid_map[new_solid_id] = solid
    solid_map.pop(related_solid_id_list[0])
    solid_map.pop(related_solid_id_list[1])
    # step4: 生成新的 BrCAD 对象进行比较
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "union", new_solid_id, related_solid_id_list, False)
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Union",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()})

# Operation "Difference"
@api_view(["POST"])
def difference(request: HttpRequest):
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    solid_1 = props.get("solid1")
    solid_2 = props.get("solid2")
    related_solid_id_list = data.get("relatedSolidIdList")
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    solid_1 = solid_map[related_solid_id_list[0]]
    solid_2 = solid_map[related_solid_id_list[1]]
    solid = BRepAlgoAPI_Cut(solid_1, solid_2).Shape()
    new_solid_id = uuid.uuid1().hex
    solid_map[new_solid_id] = solid
    solid_map.pop(related_solid_id_list[0])
    solid_map.pop(related_solid_id_list[1])
    # step4: 生成新的 BrCAD 对象进行比较
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "difference", new_solid_id, related_solid_id_list, False)
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Difference",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "diff": brcad_compare.get_diff()}) 

# Operation "Intersection"
@api_view(["POST"])
def intersection(request: HttpRequest):
    # step1: 获取参数
    params = json.loads(request.body)
    last_operation_id = params.get("lastOperationId")
    project_id = params.get("projectId")
    operator_id = params.get("operatorId")
    data = params.get("data")
    props = data.get("props")
    solid_1 = props.get("solid1")
    solid_2 = props.get("solid2")
    related_solid_id_list = data.get("relatedSolidIdList")
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步操作的 shape 和 id_TopoDS_Shape_map 和 BrCAD 对象
    brcad_1: BrCAD = pickle.loads(Operation.objects.get(id=last_operation_id).brcad)
    solid_map = get_solid_id_map(Operation.objects.get(id=last_operation_id).solid_ids)
    solid_1 = solid_map[related_solid_id_list[0]]
    solid_2 = solid_map[related_solid_id_list[1]]
    solid = BRepAlgoAPI_Common(solid_1, solid_2).Shape()
    new_solid_id = uuid.uuid1().hex
    solid_map[new_solid_id] = solid
    solid_map.pop(related_solid_id_list[0])
    solid_map.pop(related_solid_id_list[1])
    # step4: 生成新的 BrCAD 对象进行比较
    converter_2 = TopoDSShapeConvertor(get_TopoDS_Shape_from_solid_id_map(solid_map))
    brcad_2 = converter_2.get_BrCAD_after_operation(brcad_1, "intersection", new_solid_id, related_solid_id_list, False)
    brcad_compare = BrCADCompare(brcad_1, brcad_2)
    # step5: 保存操作
    solid_ids = save_shape(solid_map)
    operation = Operation(
        type="Intersection",
        project_id=project_id,
        operator_id=int(operator_id),
        time=int(time.time() * 1000),
        data=data,
        brcad=pickle.dumps(brcad_2),
        solid_ids=solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
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
    if not is_last_operation(last_operation_id, project_id):
        return ApiResponse("Wrong History! Please refresh page!", status=status.HTTP_400_BAD_REQUEST)
    # step2: 获取上一步的 BrCAD 对象
    # step3: 执行对应操作
    rollback_solid_ids = Operation.objects.get(id=rollback_operation_id).solid_ids
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
        solid_ids=rollback_solid_ids,
    )
    operation.save()
    # step6: 更新 project 的 operation_history_ids
    try:
      with transaction.atomic():
        project = Project.objects.select_for_update().get(id=project_id)
        if not is_last_operation(last_operation_id, project_id):
            operation.delete()
            return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
        project.operation_history_ids.append(operation.id)
        project.save()
    except Exception as e:
        return ApiResponse("Other users is operating, please try again.", data_status=status.HTTP_400_BAD_REQUEST)
    # step7: 通知前端更新历史记录
    notify_update_history_list(project_id)
    
    return ApiResponse({"operationId": operation.id, "model": rollback_brcad.to_dict()})
    
