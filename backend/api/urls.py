from django.urls import path

from . import views

urlpatterns = [
    path("chatrooms/", views.chatrooms_list),
    path("messages/", views.messages_api),
    path("register/", views.register),
    path("login/", views.login_view),
    path("logout/", views.logout_view),
    path("whoami/", views.whoami),
]
