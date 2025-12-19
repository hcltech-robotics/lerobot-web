import asyncio
import json
from typing import Dict, Set

from fastapi import WebSocket


class RecordWebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, topic: str, websocket: WebSocket):
        await websocket.accept()
        if topic not in self.active_connections:
            self.active_connections[topic] = set()
        self.active_connections[topic].add(websocket)

    def disconnect(self, topic: str, websocket: WebSocket):
        if topic in self.active_connections:
            self.active_connections[topic].discard(websocket)

    async def broadcast(self, topic: str, data: dict):
        if topic not in self.active_connections:
            return
        message = json.dumps(data)
        for connection in list(self.active_connections[topic]):
            try:
                await connection.send_text(message)
            except Exception:
                self.disconnect(topic, connection)


websocket_manager = RecordWebSocketManager()
