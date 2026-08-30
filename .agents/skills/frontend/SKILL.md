---
name: frontend
description: Implement or review Vue 3 and TypeScript frontend changes by first learning the repository's patterns, then making the smallest safe, well-validated change.
---

# Frontend

Use this skill for frontend implementation, bug fixes, and code review in Vue 3 + TypeScript projects. The current user's request and repository instructions take priority.

## Work from evidence

Before editing, read the task-relevant project instructions and inspect the nearest related page, component, API, type, hook, store, utility, and similar implementation. Expand that reading only when a dependency requires it; do not scan the entire repository by default.

Prefer existing solutions in this order when they fit the task:

1. Project component, hook, utility, directive, API wrapper, type, or store.
2. Framework or UI-library capability.
3. An installed dependency or browser/JavaScript platform capability.
4. Small task-specific implementation.
5. A new dependency, only with explicit user approval.

Match the project's local conventions over generic examples, including its Vue SFC style, TypeScript choices, naming, component boundaries, styles, and state scope.

## Preserve business contracts

Do not invent or infer business facts such as API paths, payload or response fields, statuses, permission codes, money units, data conversions, or workflow rules. Search the codebase, types, API modules, nearby implementations, and supplied documents. If the contract remains unknown and affects the change, ask the user.

Use precise types. Do not silence a type error with `any`, `as any`, TypeScript suppression comments, or a broad cast when a correct type, generic, inference, `unknown`, or narrowing is available.

Keep reactive logic legible: use `computed` for derived state and reserve `watch` for actual side effects. Keep state at the smallest scope that serves the feature; do not introduce global state merely to avoid passing props.

## Keep the change focused

Implement only what the request requires. Do not use an ordinary feature or bug fix to refactor unrelated code, reorganize directories, upgrade dependencies, change tooling, create speculative abstractions, or broadly reformat files.

For bugs, trace the relevant data flow and lifecycle to a root cause. Avoid unsupported timing workarounds, magic values, duplicate assignments, and incidental `nextTick` or timeout calls that conceal the symptom.

Do not add, remove, or upgrade packages unless the user explicitly authorizes it. Treat package management, build configuration, type configuration, lint configuration, environment files, and hooks as high-impact areas.

## Validate and hand off

Read the available package scripts before choosing validation. Run the narrowest relevant checks first; use lint and type checking for normal Vue/TypeScript changes, then add build, existing tests, or non-mutating UI verification when the change warrants it. Do not start a dev server if an existing one can be used or the user normally owns it.

Inspect the final diff. Confirm it contains no unrelated edits, broad formatting churn, debug code, or accidental overwrite of user changes. Distinguish newly introduced failures from pre-existing ones.

Unless the user asks otherwise, do not change Git state. In the final response, state the delivered change, the relevant validation result, and any remaining uncertainty or limitation.
