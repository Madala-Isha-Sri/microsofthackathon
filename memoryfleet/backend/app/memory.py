from typing import List, Dict
from .config import settings

try:
    from hindsight_client import Hindsight
except ImportError:
    Hindsight = None

class MemoryService:
    def __init__(self):
        self.enabled = bool(settings.hindsight_api_key and Hindsight)
        self.client = None
        if self.enabled:
            self.client = Hindsight(
                base_url=settings.hindsight_api_url,
                api_key=settings.hindsight_api_key,
            )

    def retain(self, content: str, context: str = "fleet operations"):
        if not self.enabled:
            return {"stored": False, "mode": "demo"}
        self.client.retain(
            bank_id=settings.hindsight_bank_id,
            content=content,
            context=context,
        )
        return {"stored": True, "mode": "hindsight"}

    def recall(self, query: str) -> List[Dict]:
        if not self.enabled:
            return []
        result = self.client.recall(
            bank_id=settings.hindsight_bank_id,
            query=query,
            max_tokens=3500,
            budget="mid",
        )
        return [
            {"id": r.id, "text": r.text, "type": r.type, "context": getattr(r, "context", "")}
            for r in result.results
        ]

memory = MemoryService()
