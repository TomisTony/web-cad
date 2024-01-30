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
        return ApiResponse("No project id is given", data_status=400)
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

# 删除最后一条 History    
@api_view(["POST"])
def deleteLastProjectHistory(request: HttpRequest):
    request_data = json.loads(request.body)
    project_id = request_data.get("projectId", None)
    if project_id is None:
        return ApiResponse("No project id is given", data_status=400)
    try:
        project = Project.objects.get(id=project_id)
        operation_ids = json.loads(project.operation_history_ids)
        if len(operation_ids) == 0:
            return ApiResponse("No history to delete", data_status=400)
        operation_id = operation_ids[-1]
        operation = Operation.objects.get(id=operation_id)
        operation.delete()
        operation_ids.pop(-1)
        project.operation_history_ids = json.dumps(operation_ids)
        project.save()
        # 通知前端更新历史记录
        notify_update_history_list(project_id)
        return ApiResponse("delete success")
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)