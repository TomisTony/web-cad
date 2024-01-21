from rest_framework import status as http_status
from rest_framework.response import Response

class ApiResponse(Response):
    def __init__(self,data=None, data_message='', data_status=None, status=None,
                 template_name=None, headers=None, exception=False, content_type=None):
        code = http_status.HTTP_200_OK
        # 优先使用 data_status, 其次使用 status
        if data_status is not None:
            code = data_status
        elif status is not None:
            code = status
        data = {
            'code': code,
            'message': data_message,
            'data': data,
        }

        super().__init__(data, status, template_name, headers, exception, content_type)