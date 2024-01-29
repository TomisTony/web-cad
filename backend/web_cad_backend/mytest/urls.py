from django.urls import path

from .views import operation_views, project_views

urlpatterns = [
    path("getProjectHistory", project_views.getProjectHistory, name="getProjectHistory"),
    path("operation/fillet", operation_views.fillet, name="loadDiff"),
    path("operation/uploadFile", operation_views.uploadFile, name="uploadFile"),
    path("downloadFile", operation_views.downloadFile, name="downloadFile"),
]