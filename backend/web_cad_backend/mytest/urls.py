from django.urls import path

from . import views

urlpatterns = [
    path("hello", views.hello, name="hello"),
    path("fillet", views.fillet, name="loadDiff"),
    path("uploadFile", views.uploadFile, name="uploadFile"),
    path("downloadFile", views.downloadFile, name="downloadFile"),
]