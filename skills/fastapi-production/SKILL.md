---
name: fastapi-production
description: >-
  Architects, builds, and reviews production-grade async FastAPI backends with Pydantic v2, lifespan context management, JWT auth, dependency injection, and health probes.
---

# FastAPI Production Architect

This skill guides building high-performance, asynchronous REST APIs with FastAPI, adhering to production standards, strict type safety with Pydantic v2, clean dependency injection, and cloud-native observability.

## 🏗️ Production Directory Layout

```text
app/
├── api/
│   ├── deps.py               # Shared dependencies (DB sessions, current user, rate limiters)
│   └── v1/
│       ├── router.py         # Root v1 router aggregating feature endpoints
│       └── endpoints/
│           ├── auth.py       # Authentication & token renewal
│           └── users.py      # User management endpoints
├── core/
│   ├── config.py             # Pydantic BaseSettings environment validation
│   ├── database.py           # Async SQLAlchemy engine & session factory
│   └── security.py           # JWT encoding/decoding & Argon2/bcrypt hashing
├── models/                   # SQLAlchemy ORM database models
├── schemas/                  # Pydantic v2 request/response schemas
├── services/                 # Pure domain business logic
└── main.py                   # FastAPI application initialization & lifespan
```

---

## ⚡ Core Patterns

### 1. Lifespan State Management

Avoid deprecated `@app.on_event("startup")` and `@app.on_event("shutdown")`. Use modern async context lifespans:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.database import engine
from app.core.redis import init_redis_pool, close_redis_pool

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize connection pools, caches, and telemetry
    app.state.redis = await init_redis_pool()
    try:
        yield
    finally:
        # Shutdown: Gracefully drain connections
        await close_redis_pool(app.state.redis)
        await engine.dispose()

app = FastAPI(title="Production Service", lifespan=lifespan)
```

### 2. Pydantic v2 Request & Response Schemas

Enforce strict validation, immutable attributes where appropriate, and forbid undeclared payloads:

```python
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UserBase(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
        str_strip_whitespace=True,
    )
    email: EmailStr
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

class UserResponse(UserBase):
    id: int
```

### 3. Dependency Injection & Database Sessions

Inject asynchronous SQLAlchemy sessions using an `async_sessionmaker` generator yielding into FastAPI's `Depends`:

```python
from collections.abc import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session_factory

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### 4. JWT Authentication & Permission Guards

```python
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.schemas.user import UserResponse
from app.services.auth import decode_jwt_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserResponse:
    user = await decode_jwt_token(token)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
```

### 5. Standardized Problem Details Error Envelope (RFC 7807)

```python
from fastapi import Request
from fastapi.responses import JSONResponse

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "type": "https://errors.example.com/internal-server-error",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "An unexpected error occurred. Please contact engineering support.",
            "instance": str(request.url.path),
        },
    )
```

### 6. Kubernetes Liveness & Readiness Probes

Expose separate endpoints for orchestrator checks:

```python
@app.get("/healthz/liveness", tags=["Health"])
async def liveness_check():
    return {"status": "ok"}

@app.get("/healthz/readiness", tags=["Health"])
async def readiness_check(db: AsyncSession = Depends(get_db_session)):
    await db.execute(text("SELECT 1"))
    return {"status": "ready"}
```
