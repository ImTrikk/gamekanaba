
# AGENTS.md

# Development Guidelines

These guidelines define the coding standards and engineering practices for GameKanaBa?.

All contributors and AI coding agents must follow these instructions.

## 1. Think Before Coding

- Understand the existing implementation before modifying it.
- Do not assume requirements that have not been established.
- Identify dependencies and potential side effects.
- Ask for clarification when an architectural decision is unclear.
- Prefer simple, maintainable solutions over unnecessary abstractions.

## 2. Project Architecture

- Follow the approved project architecture.
- Use feature-based organization.
- Separate business logic, data access, and presentation.
- Keep components focused and reusable.
- Avoid unnecessarily large components and files.
- Do not introduce dependencies without a clear reason.

## 3. TypeScript Standards

- Use TypeScript throughout the application.
- Avoid `any` unless there is a documented reason.
- Define reusable interfaces and types.
- Validate external and user-provided data.
- Avoid unsafe type assertions.

## 4. React Standards

- Use functional components and React hooks.
- Keep components focused on a single responsibility.
- Extract reusable logic into custom hooks.
- Avoid unnecessary state duplication.
- Follow React's rules of hooks.
- Use appropriate loading, error, and empty states.

## 5. Data Management

- Use TanStack Query for server-state management.
- Use local React state for component-specific UI state.
- Use Supabase Realtime for live game synchronization.
- Avoid unnecessary polling.
- Keep data-fetching logic separate from UI components.
- Invalidate or update relevant query caches after mutations and Realtime events.

## 6. Supabase and Security

- Follow database relationships and constraints.
- Enable and properly configure Row Level Security.
- Never expose service-role keys in frontend code.
- Never trust client-provided scores or answer correctness.
- Validate all guest player operations.
- Protect correct answers until the appropriate reveal phase.
- Use trusted server-side operations for sensitive game logic.

## 7. Error Handling

- Handle errors explicitly.
- Provide meaningful error messages.
- Avoid silently swallowing exceptions.
- Handle network disconnections and Realtime failures.
- Provide recovery mechanisms where appropriate.

## 8. Code Quality

- Use consistent naming conventions.
- Keep functions small and focused.
- Avoid unnecessary code duplication.
- Remove unused imports and variables.
- Avoid unexplained magic numbers.
- Add comments for complex business logic, not obvious code.

## 9. Testing and Validation

- Run relevant tests after implementing changes.
- Run TypeScript checks.
- Run linting when configured.
- Verify production builds when appropriate.
- Do not claim successful validation without executing it.

## 10. Change Management

- Inspect Git status before modifying files.
- Preserve existing user changes.
- Avoid unrelated modifications.
- Review the Git diff before reporting completion.
- Never rewrite Git history or force-push without explicit permission.

## 11. Documentation

- Update relevant documentation when architecture or behavior changes.
- Keep documentation consistent with the actual implementation.
- Do not duplicate project requirements across multiple documents.

## 12. Priority

When instructions conflict, follow this order:

1. Explicit user instructions for the current task.
2. Project-specific implementation guidelines.
3. Approved project architecture and requirements.
4. These general development guidelines.
