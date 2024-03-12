from django.urls import path

from .views import operation_views, project_views

urlpatterns = [
    path("getProjectHistory", project_views.getProjectHistory, name="getProjectHistory"),
    path("deleteProjectHistory", project_views.deleteProjectHistory, name="deleteProjectHistory"),

    path("getOperationModel", operation_views.getOperationModel, name="getOperationModel"),
    path("downloadFile", operation_views.downloadFile, name="downloadFile"),

    path("operation/fillet", operation_views.fillet, name="loadDiff"),
    path("operation/uploadFile/<int:project_id>/<int:operator_id>", operation_views.uploadFile, name="uploadFile"),
    path("operation/rename", operation_views.rename, name="rename"),
    path("operation/rollback", operation_views.rollback_with_concatenation_mode, name="rollback"),
]