
# Implementation Guidelines

## 1. Purpose

This document defines how GameKanaBa? should be implemented, tested, reviewed, and committed.

The goal is to build the application incrementally, maintainable and securely, while keeping changes small enough to understand and review.

These guidelines apply throughout the entire development process.

---

## 2. Documentation Priority

Before making any changes, read and follow these project documents:

1. `CLAUDE.md` — Instructions for Claude Code.
2. `AGENTS.md` — General coding and engineering standards.
3. `GameKanaBa_Project_Plan.md` — Product requirements, architecture, database design, and implementation phases.
4. `IMPLEMENTATION_GUIDELINES.md` — Development workflow, testing, and Git discipline.

If instructions conflict, stop and explain the conflict instead of silently choosing an interpretation.

Follow explicit user decisions over assumptions made in the documentation.

---

## 3. Incremental Development

### 3.1 One Phase at a Time

Development must follow the implementation phases defined in `GameKanaBa_Project_Plan.md`.

- Implement only the currently approved phase.
- Do not skip phases.
- Do not implement features assigned to future phases.
- Do not introduce unapproved features or architectural changes.
- Do not continue to the next phase without explicit user approval.

### 3.2 Break Phases into Smaller Tasks

Before implementing a phase:

1. Review its requirements and checklist.
2. Identify dependencies.
3. Break the phase into small, logical tasks.
4. Identify the files and modules likely to be affected.
5. Determine how each task will be validated.
6. Present the proposed task breakdown when the scope is substantial.

Tasks should be small enough to implement, test, and review independently.

### 3.3 Implement in Logical Units

Avoid implementing an entire phase in one large, uncontrolled change.

Prefer logical units such as:

- Project configuration
- Database migrations
- Authentication
- Shared components
- Feature modules
- API or Supabase integration
- Tests and documentation

Complete and validate each logical unit before moving to the next.

---

## 4. Understand Before Changing

Before modifying existing code:

- Inspect the relevant files.
- Understand the current implementation.
- Check existing conventions and patterns.
- Identify dependencies and potential side effects.
- Reuse existing utilities and components when appropriate.
- Avoid duplicating existing functionality.

Do not rewrite working code simply because another implementation is preferred.

If a requirement is unclear, ask for clarification before making assumptions that could affect architecture, data structures, security, or user experience.

---

## 5. Code Quality

### 5.1 TypeScript

- Use TypeScript consistently.
- Avoid `any` unless absolutely necessary and documented.
- Prefer explicit types for important data structures.
- Use reusable types and interfaces.
- Avoid unnecessary type assertions.
- Keep types aligned with the database schema.

### 5.2 React

- Use functional components and hooks.
- Keep components focused and reasonably small.
- Extract reusable logic into custom hooks.
- Avoid unnecessary component state.
- Separate UI concerns from business logic.
- Avoid unnecessary re-renders and premature optimization.

### 5.3 State Management

Use the appropriate state management approach:

- TanStack Query for asynchronous server state and data fetching.
- React state for local UI state.
- Supabase Realtime for live session updates.

Avoid maintaining multiple conflicting copies of the same server data.

### 5.4 Project Structure

- Organize code by feature or responsibility.
- Keep components, hooks, types, and utilities appropriately separated.
- Avoid oversized files containing unrelated functionality.
- Use clear and consistent naming conventions.
- Keep shared components reusable without making them unnecessarily generic.

---

## 6. Supabase and Security

Security is a core requirement, especially because guest players can participate without creating accounts.

Always follow these rules:

- Enable and properly configure Row Level Security (RLS).
- Never expose the Supabase service-role key in frontend code.
- Never rely on frontend validation alone for sensitive operations.
- Do not allow clients to directly determine authoritative scores.
- Do not expose correct answers before the appropriate reveal stage.
- Validate participant identity and permissions for session operations.
- Protect host-only operations.
- Prevent unauthorized access to private games and sessions.
- Validate answer submissions and session state on the trusted server side.
- Use secure and appropriate guest participant credentials.
- Design operations to handle duplicate requests and concurrent submissions safely.

For authoritative gameplay operations, use trusted server-side logic such as Supabase Edge Functions or appropriate database functions.

Do not weaken security policies merely to make development or testing easier.

If a security requirement cannot be implemented safely using the proposed architecture, explain the issue and recommend an alternative before proceeding.

---

## 7. Database and Realtime Changes

Before changing database structures:

1. Review the existing schema.
2. Check related tables, foreign keys, and constraints.
3. Consider RLS implications.
4. Consider how existing data and application code will be affected.
5. Use migrations for schema changes.
6. Keep migrations organized and reversible where practical.

For Supabase Realtime:

- Subscribe only to the data needed by the current feature.
- Scope subscriptions to the appropriate game session.
- Handle subscription cleanup.
- Handle disconnections and reconnections.
- Do not assume that receiving a Realtime event guarantees that the client has the latest complete state.
- Fetch or reconcile authoritative state when necessary.

Avoid placing sensitive information in public or broadly accessible Realtime payloads.

---

## 8. Error Handling and User Experience

- Provide understandable error messages.
- Handle loading, empty, success, and error states.
- Avoid silently swallowing errors.
- Handle network interruptions and unexpected disconnections.
- Prevent duplicate submissions where appropriate.
- Provide clear feedback for important actions.
- Keep the host and player experiences consistent with the current session state.

For multiplayer functionality, consider what happens when:

- The host disconnects.
- A player refreshes the page.
- A player reconnects.
- Two players submit simultaneously.
- The timer expires during submission.
- The host advances or ends a question.
- A session ends unexpectedly.

---

## 9. Testing and Validation

Every logical implementation unit must be validated before proceeding.

Use the appropriate checks based on the changes made:

- TypeScript type checking.
- ESLint.
- Unit tests.
- Component tests.
- Integration tests.
- Supabase migration validation.
- Production build.
- Manual browser testing.

At minimum, run the relevant type checking, linting, and build commands when completing a phase, provided those scripts are configured.

Do not claim a test passed if it was not actually executed.

If a check fails:

1. Inspect the failure.
2. Determine whether it was introduced by the current changes.
3. Fix issues within the approved scope.
4. Rerun the relevant checks.
5. Report unresolved failures honestly.

Do not hide existing failures or unrelated problems.

---

## 10. Git and Commit Discipline

Git history must remain clean, understandable, and organized.

### 10.1 Before Making Changes

Inspect the current Git state:

```bash
git status
git branch --show-current
git log -5 --oneline
```

Never assume the working tree is clean.

Do not overwrite, discard, or modify unrelated user changes.

### 10.2 Small, Logical Commits

Organize changes into small, cohesive commits.

A commit should represent one logical implementation unit.

Examples:

```text
chore: initialize React and TypeScript project
chore: configure Supabase client
feat: add host authentication
feat: implement quiz game creation
feat: add question management
fix: prevent duplicate answer submissions
test: add session scoring tests
docs: document Supabase environment setup
```

Follow Conventional Commits:

```text
<type>: <short description>
```

Common types:

- `feat` — New functionality.
- `fix` — Bug fixes.
- `chore` — Configuration and maintenance.
- `refactor` — Code restructuring without intended behavior changes.
- `test` — Tests.
- `docs` — Documentation.
- `style` — Formatting and styling changes without behavior changes.

### 10.3 No Automatic Commits

**Claude Code must never create Git commits without explicit user approval.**

When a logical implementation unit or phase is complete:

1. Inspect `git status`.
2. Review the complete relevant diff.
3. Identify unrelated or unexpected changes.
4. Run the appropriate validation.
5. Propose a commit breakdown.
6. Provide the exact files belonging to each proposed commit.
7. Suggest a Conventional Commit message.

Wait for the user to approve before staging or committing.

### 10.4 Git Operations Requiring Explicit Approval

Never perform these without explicit user permission:

- `git commit`
- `git commit --amend`
- `git reset`
- `git rebase`
- `git cherry-pick`
- `git push --force`
- Deleting branches
- Rewriting Git history
- Discarding uncommitted changes

Do not use `git add .` or `git add -A` blindly.

Stage only the specific files approved for a commit.

Never commit:

- `.env` files or secrets.
- Service-role keys.
- Passwords or credentials.
- Local database dumps containing sensitive data.
- Unnecessary generated files.
- Build artifacts unless explicitly required.

---

## 11. Dependency Management

Before installing a dependency:

1. Determine whether the functionality can be implemented with existing dependencies.
2. Explain why the new dependency is necessary.
3. Check compatibility with the current project.
4. Avoid adding unnecessary packages.

Do not upgrade or replace major dependencies without a clear reason and user approval.

Keep package versions and lockfiles consistent.

---

## 12. Documentation Maintenance

Update documentation when changes affect:

- Project architecture.
- Database schema.
- Environment variables.
- Setup instructions.
- Authentication or authorization.
- Supabase policies.
- Realtime behavior.
- API contracts.
- Important implementation decisions.

Keep documentation accurate and consistent with the actual implementation.

Do not modify the original product requirements without approval.

---

## 13. Phase Completion Report

At the end of each phase, provide a structured report.

### Phase Completion Report

**Phase:** [Phase name]

**Status:** Completed / Partially Completed / Blocked

**1. Summary**

- Brief description of what was implemented.

**2. Completed Tasks**

- List each completed task.

**3. Files Changed**

- List created, modified, and deleted files.
- Explain significant changes.

**4. Database Changes**

- List migrations, schema changes, RLS policies, and database functions, if applicable.

**5. Validation**

- List commands and tests executed.
- Include actual results.
- Identify failures or skipped checks.

**6. Git Summary**

- Current branch.
- Working tree status.
- Changed files.
- Proposed commit breakdown.
- Suggested commit messages.

**7. Outstanding Issues**

- Known bugs.
- Incomplete work.
- Technical concerns.
- Follow-up tasks.

**8. Next Phase**

- Briefly identify what the next phase involves.
- Do not begin it.

---

## 14. Approval Gates

The following actions require explicit user approval:

- Starting a new implementation phase.
- Making significant architectural changes.
- Adding major dependencies.
- Changing the approved database architecture.
- Introducing features outside the current phase.
- Performing destructive or history-rewriting Git operations.
- Creating Git commits.
- Deploying or publishing the application.
- Changing production infrastructure or data.

Do not interpret silence as approval.

Do not proceed simply because the next task appears obvious.

---

## 15. Expected Development Workflow

Follow this workflow throughout the project:

1. Read and understand the relevant documentation.
2. Inspect the current project and Git state.
3. Identify the approved phase and scope.
4. Break the work into logical tasks.
5. Implement one task at a time.
6. Validate each implementation unit.
7. Review the affected code and complete Git diff.
8. Fix issues within the approved scope.
9. Prepare the phase completion report.
10. Propose small, logical commits.
11. Wait for explicit user approval.
12. Proceed to the next phase only after approval.

**The guiding principle: Implement deliberately, validate continuously, review every change, and never sacrifice security or maintainability for speed.**
