from  django.urls import re_path

from cad import consumers

websocket_urlpatterns = [
    re_path(r'^websocket$', consumers.Consumer.as_asgi())
]
