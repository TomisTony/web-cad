from channels.generic.websocket import AsyncWebsocketConsumer

import json
from urllib.parse import parse_qs


class Consumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.projectId = parse_qs(self.scope["query_string"].decode("utf8"))["projectId"][0]
        await self.channel_layer.group_add(
            "project_" + self.projectId,
            self.channel_name
        )
        
    async def updateHistoryList(self, event):
        print("updateHistoryList", self.channel_name)
        await self.send(text_data=json.dumps({
            "type": "updateHistoryList",
            "data": event["data"],
        }))
        
        
    async def disconnect(self, close_code):
        print("disconnect", self.channel_name)
        await self.channel_layer.group_discard(
            "project_" + self.projectId,
            self.channel_name
        )
