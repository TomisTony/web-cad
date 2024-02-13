from rest_framework.decorators import api_view
from rest_framework import status
from utils.api_response import ApiResponse
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

import json


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
def logout_user(request: HttpRequest):
    logout(request)
    return ApiResponse("logout success")


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
                "username": user.username,
                "email": user.email,
                "join_time": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
                "last_login": (
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
    username = params.get("username", None)
    email = params.get("email", None)
    if user_id is None or username is None or email is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(id=user_id)
        user.username = username
        user.email = email
        user.save()
        return ApiResponse("update success")
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
            return ApiResponse(
                "old password is wrong", data_status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)
        user.save()
        return ApiResponse("update password success")
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
