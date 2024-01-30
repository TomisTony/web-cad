from django.urls import path

from .views import operation_views, project_views

urlpatterns = [
    path("getProjectHistory", project_views.getProjectHistory, name="getProjectHistory"),
    path("getOperationModel", operation_views.getOperationModel, name="getOperationModel"),
    path("deleteProjectHistory", project_views.deleteProjectHistory, name="deleteProjectHistory"),
    path("operation/fillet", operation_views.fillet, name="loadDiff"),
    path("operation/uploadFile/<int:project_id>", operation_views.uploadFile, name="uploadFile"),
    path("downloadFile", operation_views.downloadFile, name="downloadFile"),
]