# Go (Golang) Engineering Standards

Apply these rules when writing or refactoring Go code.

## 1. Idiomatic Go

- **Explicit Error Handling**: Never ignore error returns (`_`). Always inspect `err != nil`. Wrap errors with context using `fmt.Errorf("failed to process order %s: %w", id, err)`.
- **Context Propagation**: Pass `ctx context.Context` as the first parameter to functions that perform I/O, network calls, or long-running computations.
- **Table-Driven Tests**: Organize unit tests using table-driven test patterns with `t.Run(tc.name, func(t *testing.T) { ... })`.
- **Concurrency Safety**: Protect shared state with `sync.Mutex` or channels. Run tests with `-race` flag to detect race conditions.
