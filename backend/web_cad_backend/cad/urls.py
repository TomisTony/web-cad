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
    path("operation/deleteSolid", operation_views.deleteSolid, name="deleteSolid"),
    path("operation/makeBox", operation_views.makeBox, name="box"),
    path("operation/makeTorus", operation_views.makeTorus, name="torus"),
    path("operation/makeCone", operation_views.makeCone, name="cone"),
    path("operation/makeSphere", operation_views.makeSphere, name="sphere"),
    path("operation/makeCylinder", operation_views.makeCylinder, name="cylinder"),
    path("operation/boolean", operation_views.boolean, name="boolean"),
    path("operation/union", operation_views.union, name="union"),
    path("operation/difference", operation_views.difference, name="difference"),
    path("operation/intersection", operation_views.intersection, name="intersect"),
    path("operation/rollback", operation_views.rollback_with_concatenation_mode, name="rollback"),
]