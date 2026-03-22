from django.contrib import admin

from .models import ChatRoom, Message


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "chatroom", "poster", "created")
    list_filter = ("chatroom",)
    search_fields = ("title", "content", "poster__username")
