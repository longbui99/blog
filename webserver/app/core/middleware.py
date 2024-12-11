from starlette.middleware.base import BaseHTTPMiddleware
import logging
import time

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        status_code = response.status_code
        log_function = logging.error if status_code >= 400 else logging.info
        
        log_message = (
            f"{request.client.host} - "
            f"{status_code} {request.method} {request.url} "
            f"(completed in {process_time:.2f}s)"
        )
        log_function(log_message)
        
        return response 