"""
Rate limiting middleware for API endpoints
Prevents brute force attacks and API abuse
"""

import os
import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware.
    For production with multiple instances, use Redis-based rate limiting.
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.enabled = os.environ.get("RATE_LIMIT_ENABLED", "true").lower() == "true"
        self.requests_per_minute = int(os.environ.get("RATE_LIMIT_PER_MINUTE", "60"))
        self.rate_limit_window = 60  # 1 minute in seconds
        
        # Store: {client_ip: [(timestamp1, timestamp2, ...)]}
        self.requests = defaultdict(list)
        
        logger.info(f"Rate limiting {'enabled' if self.enabled else 'disabled'}: {self.requests_per_minute} requests/minute")
    
    async def dispatch(self, request: Request, call_next):
        if not self.enabled:
            return await call_next(request)
        
        # Skip rate limiting for health check
        if request.url.path == "/api/health":
            return await call_next(request)
        
        # Get client IP
        client_ip = request.client.host
        current_time = time.time()
        
        # Clean old requests outside the window
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if current_time - req_time < self.rate_limit_window
        ]
        
        # Check if rate limit exceeded
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute allowed."
            )
        
        # Add current request
        self.requests[client_ip].append(current_time)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = self.requests_per_minute - len(self.requests[client_ip])
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        response.headers["X-RateLimit-Reset"] = str(int(current_time + self.rate_limit_window))
        
        return response
