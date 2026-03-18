# Task Completion Requirements
- Always run `pnpm lint:write` and `pnpm typecheck` before considering the task is completed (if any edits were made).

# Project Snapshot
Weekview is an SPA for generating weekly schedules for students.

# Core priorities
1. Performance first.
2. Reliability first.
3. Design consistency.

If a tradeoff is required, choose correctness and robustness over short-term convenience.

## Maintainability

Long term maintainability is a core priority. If you add new functionality, first check if there is shared logic that can be extracted to a separate module. Duplicate logic across multiple files is a code smell and should be avoided. Don't be afraid to change existing code. Don't take shortcuts by just adding local logic to solve a problem.
