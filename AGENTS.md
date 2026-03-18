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

## Best Practices

Apply best practices whichever applies in the skill, including but not limited to:

- Avoid generic "AI slop" design aesthetics. Make sure design stay consistent with the rest of the app.
- Use shadcn-ui CLI to add new shadcn components instead of writing one on your own.

### React Component Architecture
When refactoring large components, **DO NOT** create monolithic "God Hooks/Components" (e.g., `use[Component]Logic`) that return dozens of mixed properties. Instead, you must strictly adhere to the following composition rules:

1. **Decompose by Domain/Feature:** Split logic into multiple, highly-focused custom hooks based on responsibility. 
   - *Example:* Instead of one big hook, create `useUserFetch`, `usePermissionsCheck`, and `useTableSorting`.
2. **Keep UI State Local:** Standard UI interaction state (e.g., `isOpen`, `isHovered`, raw `searchInputValue`) MUST remain inside the component itself. Do not put UI state inside domain-logic hooks.
3. **Hook Cascading:** It is expected and encouraged that components will call multiple custom hooks, passing the output of one hook as an argument into another (e.g., passing fetched data into a filtering hook).
4. **Naming:** Name hooks based on what they *do* (e.g., `useTimetableConflicts`), not where they *live* (e.g., `useCourseSlipDialogLogic`).
5. **Strict `useEffect` Minimization:** Treat `useEffect` as an absolute last resort used ONLY for synchronizing with non-React external systems (e.g., manual DOM manipulation, WebSockets).
   - **Data Fetching:** Never use effects; use TanStack Query.
   - **Derived State:** Never use effects to update state based on other state; calculate it directly during render.
   - **User Actions:** Never use effects to react to a state change; put the logic directly inside the event handler (e.g., `onClick`, `onSubmit`).