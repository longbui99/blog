from fastapi.responses import Response
from typing import Any

class XMLResponse(Response):
    media_type = "application/xml"

    def __init__(
        self,
        content: Any,
        status_code: int = 200,
        headers: dict = None,
        media_type: str = None,
    ) -> None:
        super().__init__(content, status_code, headers, media_type)
