from rest_framework.decorators import api_view
from rest_framework import status
from utils.api_response import ApiResponse
from django.http import HttpRequest
from django.contrib.auth.models import User
from django.contrib.auth import authenticate,login,logout

@api_view(["POST"])
def register_user(request: HttpRequest):
    username = request.POST.get("username", None)
    password = request.POST.get("password", None)
    email = request.POST.get("email", None)
    if username is None or password is None or email is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        # 确保用户名和邮箱唯一
        if User.objects.filter(username=username).exists():
            return ApiResponse("username already exists", data_status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return ApiResponse("email already exists", data_status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username, email, password)
        user.save()
        return ApiResponse("register success")
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def login_user(request: HttpRequest):
    username = request.POST.get("username", None)
    password = request.POST.get("password", None)
    if username is None or password is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        return ApiResponse("login success")
    else:
        return ApiResponse("login failed", data_status=status.HTTP_400_BAD_REQUEST)
    
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
        return ApiResponse({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "join_time": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
            "last_login": user.last_login.strftime("%Y-%m-%d %H:%M:%S") if user.last_login is not None else None,
        })
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def update_user_info(request: HttpRequest):
    user_id = request.POST.get("userId", None)
    username = request.POST.get("username", None)
    email = request.POST.get("email", None)
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
    user_id = request.POST.get("userId", None)
    old_password = request.POST.get("oldPassword", None)
    new_password = request.POST.get("newPassword", None)
    if user_id is None or old_password is None or new_password is None:
        return ApiResponse("params miss", data_status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(id=user_id)
        if not user.check_password(old_password):
            return ApiResponse("old password is wrong", data_status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return ApiResponse("update password success")
    except Exception as e:
        return ApiResponse("server error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)