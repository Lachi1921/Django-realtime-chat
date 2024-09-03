from django.urls import path
from .consumers import *

websocket_urlpatterns = [
    path('ws/messenger/<int:sender_id>/<int:receiver_id>/', ChatConsumer.as_asgi()),
    path('ws/messenger/group/<int:group_id>/', GroupChatConsumer.as_asgi())
]
