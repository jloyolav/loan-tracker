"""Entry re-export for ASGI servers.

Run from this directory (`loan-tracker/backend`):

    uvicorn main:app --reload

Alternatively:

    uvicorn app.main:app --reload
"""

from app.main import app

__all__ = ["app"]
