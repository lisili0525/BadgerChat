from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    poster = serializers.CharField(source="poster.username", read_only=True)
    chatroom = serializers.CharField(source="chatroom.name", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "poster", "title", "content", "chatroom", "created"]
