import re

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import ChatRoom, Message
from .serializers import MessageSerializer

User = get_user_model()
PIN_RE = re.compile(r"^\d{7}$")


def _normalize_username(raw):
    return (raw or "").strip().lower()


@api_view(["GET"])
@permission_classes([AllowAny])
def chatrooms_list(request):
    names = ChatRoom.objects.order_by("name").values_list("name", flat=True)
    return Response(list(names))


@api_view(["GET", "POST", "DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def messages_api(request):
    if request.method == "GET":
        return _messages_list(request)
    if request.method == "POST":
        return _messages_create(request)
    return _messages_delete(request)


def _messages_list(request):
    chatroom_name = request.query_params.get("chatroom")
    try:
        page = int(request.query_params.get("page", 1))
    except (TypeError, ValueError):
        return Response(
            {"msg": "A page number must be between 1 and 4."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if page < 1 or page > 4:
        return Response(
            {"msg": "A page number must be between 1 and 4."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        room = ChatRoom.objects.get(name=chatroom_name)
    except ChatRoom.DoesNotExist:
        return Response(
            {
                "msg": "The specified chatroom does not exist. Chatroom names are case-sensitive."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    qs = list(Message.objects.filter(chatroom=room).order_by("-created")[:100])
    start = (page - 1) * 25
    page_messages = qs[start : start + 25]
    data = MessageSerializer(page_messages, many=True).data
    return Response(
        {
            "msg": "Successfully got the latest messages!",
            "page": page,
            "messages": data,
        }
    )


def _messages_create(request):
    if not request.user or not request.user.is_authenticated:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    chatroom_name = request.query_params.get("chatroom")
    try:
        room = ChatRoom.objects.get(name=chatroom_name)
    except ChatRoom.DoesNotExist:
        return Response(
            {
                "msg": "The specified chatroom does not exist. Chatroom names are case-sensitive."
            },
            status=status.HTTP_404_NOT_FOUND,
        )
    title = request.data.get("title")
    content = request.data.get("content")
    if not title or not content:
        return Response(
            {"msg": "Title and content are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    msg = Message.objects.create(
        chatroom=room,
        poster=request.user,
        title=title,
        content=content,
    )
    return Response(MessageSerializer(msg).data, status=status.HTTP_200_OK)


def _messages_delete(request):
    if not request.user or not request.user.is_authenticated:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    raw_id = request.query_params.get("id")
    try:
        mid = int(raw_id)
    except (TypeError, ValueError):
        return Response(
            {"msg": "Invalid message id."}, status=status.HTTP_400_BAD_REQUEST
        )
    try:
        message = Message.objects.get(pk=mid)
    except Message.DoesNotExist:
        return Response(
            {"msg": "Message not found."}, status=status.HTTP_404_NOT_FOUND
        )
    if message.poster_id != request.user.id:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    message.delete()
    return Response({"msg": "Deleted."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = _normalize_username(request.data.get("username"))
    pin = request.data.get("pin")
    if not username or not pin:
        return Response(
            {"msg": "Username and pin are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not PIN_RE.match(str(pin)):
        return Response(
            {"msg": "Pin must be a 7-digit number."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if User.objects.filter(username__iexact=username).exists():
        return Response(
            {"msg": "Username already taken."}, status=status.HTTP_409_CONFLICT
        )
    user = User.objects.create_user(username=username, password=str(pin))
    token = Token.objects.create(user=user)
    return Response(
        {
            "msg": "Successfully registered.",
            "user": {"id": user.id, "username": user.username},
            "token": token.key,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = _normalize_username(request.data.get("username"))
    pin = request.data.get("pin")
    if not username or not pin:
        return Response(
            {"msg": "Username and pin are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user = User.objects.filter(username__iexact=username).first()
    if user is None or not user.check_password(str(pin)):
        return Response(
            {"msg": "Incorrect username or pin."}, status=status.HTTP_401_UNAUTHORIZED
        )
    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {
            "msg": "Successfully authenticated.",
            "user": {"id": user.id, "username": user.username},
            "token": token.key,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    Token.objects.filter(user=request.user).delete()
    return Response({"msg": "Successfully logged out."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def whoami(request):
    return Response({"user": {"id": request.user.id, "username": request.user.username}})
