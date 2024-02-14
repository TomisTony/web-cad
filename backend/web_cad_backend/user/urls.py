from django.urls import path
import user.views as views


urlpatterns = [
    path("register", views.register_user, name="register"),
    path("login", views.login_user, name="login"),
    path("getUserInfo", views.get_user_info, name="getUserInfo"),
    path("updateUserInfo", views.update_user_info, name="updateUserInfo"),
    path("updateUserPassword", views.update_user_password, name="updateUserPassword"),
    path("getProjectList", views.get_project_list, name="getProjectList"),
    path("deleteProject", views.delete_project, name="deleteProject"),
    path("getAllUser", views.get_all_user, name="getAllUser"),
    path("createProject", views.create_project, name="createProject"),
    path("updateProject", views.update_project, name="updateProject"),
]