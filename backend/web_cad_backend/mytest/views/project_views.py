from rest_framework.decorators import api_view
from rest_framework import status
from utils.api_response import ApiResponse
from mytest.models import Operation
from mytest.models import Project
from django.http import HttpRequest

from mytest.views.channels_views import notify_update_history_list

import pickle
import json

@api_view(["GET"])
def getProjectHistory(request: HttpRequest):
    project_id = request.GET.get("projectId", None)
    if project_id is None:
        return ApiResponse("No project id is given", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        project = Project.objects.get(id=project_id)
        operation_ids = json.loads(project.operation_history_ids)
        operations = Operation.objects.filter(id__in=operation_ids)
        data = []
        for operation in operations:
            operation_data =  {
                    "operationId": operation.id,
                    "time": operation.time,
                    "operator": operation.operator,
                    "operationName": operation.type,
                }
            if operation.data is not None:
                operation_data["operationSubmitValues"] = json.loads(operation.data)
            data.append(operation_data)
        return ApiResponse(data)
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 删除某个 operationId 之后项目的所有 History    
@api_view(["POST"])
def deleteProjectHistory(request: HttpRequest):
    request_data = json.loads(request.body)
    project_id = request_data.get("projectId", None)
    operation_id = request_data.get("operationId", None)
    if project_id is None or operation_id is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        project = Project.objects.get(id=project_id)
        operation_ids = json.loads(project.operation_history_ids)
        if len(operation_ids) == 0:
            return ApiResponse("No history to delete", data_status=status.HTTP_400_BAD_REQUEST)
        if operation_id not in operation_ids:
            return ApiResponse("operationId not in history", data_status=status.HTTP_400_BAD_REQUEST)
        index = operation_ids.index(operation_id)
        operation_ids = operation_ids[:index]
        deleted_operation_ids = operation_ids[index:]
        project.operation_history_ids = json.dumps(operation_ids)
        project.save()
        # 删除数据库中的数据
        Operation.objects.filter(id__in=deleted_operation_ids).delete()
        # 通知前端更新历史记录
        notify_update_history_list(project_id)
        return ApiResponse("delete success")
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)