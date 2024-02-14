from rest_framework.decorators import api_view
from rest_framework import status
from utils.api_response import ApiResponse
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

from cad.models import Project

import json
from typing import List


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request: HttpRequest):
    params = json.loads(request.body)
    username = params.get("username", None)
    password = params.get("password", None)
    email = params.get("email", None)
    if username is None or password is None or email is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        # 确保用户名和邮箱唯一
        if User.objects.filter(username=username).exists():
            return ApiResponse({"success": False, "message": "username already exists"})
        if User.objects.filter(email=email).exists():
            return ApiResponse({"success": False, "message": "email already exists"})
        user = User.objects.create_user(username, email, password)
        user.save()
        return ApiResponse({"success": True, "message": "register success"})
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request: HttpRequest):
    params = json.loads(request.body)
    username = params.get("username", None)
    password = params.get("password", None)
    if username is None or password is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        token = RefreshToken.for_user(user).access_token
        # 获取 user 对应的 id
        return ApiResponse(
            {
                "success": True,
                "message": "login success",
                "userData": {
                    "token": str(token),
                    "name": user.get_username(),
                    "id": user.id,
                },
            }
        )
    else:
        return ApiResponse(
            {"success": False, "message": "username or password is wrong"}
        )

@api_view(["GET"])
def get_user_info(request: HttpRequest):
    user_id = request.GET.get("userId", None)
    if user_id is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(id=user_id)
        return ApiResponse(
            {
                "id": user_id,
                "name": user.username,
                "email": user.email,
                "joinTime": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
                "lastLoginTime": (
                    user.last_login.strftime("%Y-%m-%d %H:%M:%S")
                    if user.last_login is not None
                    else None
                ),
            }
        )
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def update_user_info(request: HttpRequest):
    params = json.loads(request.body)
    user_id = params.get("userId", None)
    username = params.get("name", None)
    email = params.get("email", None)
    if user_id is None or username is None or email is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(id=user_id)
        user.username = username
        user.email = email
        user.save()
        return ApiResponse({"success": True})
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def update_user_password(request: HttpRequest):
    params = json.loads(request.body)
    user_id = params.get("userId", None)
    old_password = params.get("oldPassword", None)
    new_password = params.get("newPassword", None)
    if user_id is None or old_password is None or new_password is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(id=user_id)
        if not user.check_password(old_password):
            return ApiResponse({"success": False})
        user.set_password(new_password)
        user.save()
        return ApiResponse({"success": True})
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
def get_project_list(request: HttpRequest):
    user_id = request.GET.get("userId", None)
    if user_id is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        origin_projects = Project.objects.all()
        projects: List[Project] = []
        for project in origin_projects:
            if int(user_id) in project.editor_ids or int(user_id) == project.owner_id:
                projects.append(project)
        data = []
        for project in projects:
            owner = User.objects.get(id=project.owner_id).get_username()
            data.append(
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "createTime": project.create_time,
                    "owner": owner,
                }
            )
        return ApiResponse(data)
    except Exception as e:
        print(e)
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
def delete_project(request: HttpRequest):
    project_id = request.GET.get("projectId", None)
    user_id = request.GET.get("userId", None)
    if project_id is None or user_id is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        project = Project.objects.get(id=project_id)
        # 检查 user_id 是否是项目的 owner
        if int(user_id) != project.owner_id:
            return ApiResponse({"success": False, "message": "permission denied"})
        project.delete()
        return ApiResponse({"success": True})
    except Exception as e:
        return ApiResponse({"success": False, "message": "server error"})
