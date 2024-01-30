from mytest.models import Operation
from mytest.models import Project

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import json

def notify_update_history_list(project_id: int):
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

        # 通知前端更新历史记录
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "project_" + str(project_id),
            {
                "type": "updateHistoryList",
                "data": json.dumps(data),
            }
        )
        
    except Exception as e:
        print(e)