# Python Engineering Standards

Apply these rules when reading, writing, or refactoring Python code.

## 1. Modern Python (3.11+)

- **Type Hints Everywhere**: Every function must specify parameter types and return type annotations.
- **PEP 604 & 695**: Use modern union syntax (`str | None` instead of `Optional[str]`) and modern type aliases.
- **Pydantic v2**: Use `pydantic.BaseModel` with strict field validations for data transfer objects (DTOs) and API payloads.
- **Formatting & Linting**: Follow PEP 8 via `ruff` and `black`. Zero unused imports or unformatted blocks.

## 2. Robust Async & Concurrency

- **Structured Concurrency**: Use `asyncio.TaskGroup()` (Python 3.11+) rather than unchecked `asyncio.gather()` whenever possible to prevent task leaks.
- **Context Managers**: Wrap network sessions, database connections, and file handles in `async with` or `with` blocks.
- **Exception Chaining**: Always use `raise CustomError(...) from err` to preserve stack traces.
