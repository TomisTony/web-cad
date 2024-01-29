from rest_framework.decorators import api_view
from rest_framework import status
from utils.api_response import ApiResponse
from mytest.models import Operation
from mytest.models import Project
from django.http import HttpRequest

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
                    "operatior": operation.operator,
                    "operationName": operation.type,
                }
            if operation.data is not None:
                operation_data["data"] = json.loads(operation.data)
            data.append(operation_data)
        return ApiResponse(data)
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)