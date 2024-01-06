from rest_framework import status
from rest_framework.response import Response

class ApiResponse(Response):
    def __init__(self,data=None, data_message='', data_status=status.HTTP_200_OK, status=None,
                 template_name=None, headers=None, exception=False, content_type=None):
        data = {
            'code': data_status,
            'message': data_message,
            'data': data,
        }

        super().__init__(data, status, template_name, headers, exception, content_type)