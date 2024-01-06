from django.urls import path

from . import views

urlpatterns = [
    path("hello", views.hello, name="hello"),
    path("loadModel", views.loadModel, name="loadModel"),
    path("loadDiff", views.loadDiff, name="loadDiff"),
]