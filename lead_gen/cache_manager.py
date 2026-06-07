"""Disk-backed cache to avoid repeat fetching within 24 hours."""

import hashlib
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

_CACHE_ROOT = Path(__file__).parent / "cache"
_TTL_HOURS = 24


class CacheManager:
    def __init__(self, source: str) -> None:
        self._dir = _CACHE_ROOT / source
        self._dir.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        digest = hashlib.md5(key.encode()).hexdigest()
        return self._dir / f"{digest}.json"

    def get(self, key: str) -> Optional[Any]:
        p = self._path(key)
        if not p.exists():
            return None
        try:
            cached = json.loads(p.read_text())
            cached_at = datetime.fromisoformat(cached["cached_at"])
            if datetime.utcnow() - cached_at > timedelta(hours=_TTL_HOURS):
                logger.debug("Cache expired: %s", key[:80])
                return None
            logger.debug("Cache hit: %s", key[:80])
            return cached["data"]
        except Exception:
            return None

    def set(self, key: str, data: Any) -> None:
        payload = {"cached_at": datetime.utcnow().isoformat(), "data": data}
        self._path(key).write_text(json.dumps(payload, default=str))
