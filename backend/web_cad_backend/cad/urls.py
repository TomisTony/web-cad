from django.urls import path

from .views import operation_views, project_views

urlpatterns = [
    path("getProjectHistory", project_views.getProjectHistory, name="getProjectHistory"),
    path("deleteProjectHistory", project_views.deleteProjectHistory, name="deleteProjectHistory"),

    path("getOperationModel", operation_views.getOperationModel, name="getOperationModel"),
    path("downloadFile", operation_views.downloadFile, name="downloadFile"),

    path("operation/fillet", operation_views.fillet, name="fillet"),
    path("operation/chamfer", operation_views.chamfer, name="chamfer"),
    path("operation/uploadFile/<int:project_id>/<int:operator_id>/<str:last_operation_id>", operation_views.uploadFile, name="uploadFile"),
    path("operation/transform", operation_views.transform, name="transform"),
    path("operation/rename", operation_views.rename, name="rename"),
    path("operation/makeBox", operation_views.makeBox, name="box"),
    path("operation/makeCylinder", operation_views.makeCylinder, name="cylinder"),
    path("operation/rollback", operation_views.rollback_with_concatenation_mode, name="rollback"),
]