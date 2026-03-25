# ITMS API – Coding Standards

## Language & Runtime
- TypeScript 5.x with strict mode enabled
- Node.js 20 LTS
- Express 4.x for HTTP routing

## Project Structure
- `src/` — all source code
- `tests/` — Jest unit tests
- `dist/` — compiled output (git-ignored)

## Conventions
- Use `async/await` for async operations
- All errors must extend `AppError` from `src/errors/app.error.ts`
- Use centralized error middleware (`src/middleware/error.middleware.ts`) — never send error responses inline
- Repository layer handles all file I/O; services contain business logic only
- Controllers are thin: parse request, call service, return response

## Testing
- Use Jest with ts-jest preset
- Mock all repositories in unit tests
- Test files live in `tests/`

## Naming
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Enums: `SCREAMING_SNAKE_CASE` values
