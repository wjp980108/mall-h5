---
name: mall-h5
description: Implement or review the Mall H5 mobile storefront while preserving its Vue 3, TypeScript, Pinia, and typed-request conventions.
---

# Mall H5

Use this skill for code changes in the Mall H5 storefront. Follow the current `AGENTS.md` and nearby implementation patterns first. Treat the application as a consumer-facing mobile mall, not an administration console.

## Product and routing boundaries

Organize work around shopper flows such as browsing, product details, cart, checkout, orders, and profile. Do not introduce administration layouts, permission-driven menus, or backend-driven dynamic routes unless the user explicitly requests them.

Keep business routes as static modules. Add a route by creating a module under `src/router/modules/`; route metadata should describe page and tab behavior only when the current router consumes it.

## UI and state

Design mobile-first interfaces: prioritize small screens, touch interaction, scroll behavior, and safe areas for fixed bottom controls. Reuse the project's existing components, UnoCSS utilities, and styling conventions before adding dependencies or desktop-oriented UI patterns.

Keep short-lived UI state local. Use Pinia only for state shared across pages, such as the shopper session or cart. Do not infer product, price, stock, order, or payment contracts; inspect the API module and types before implementing a flow.

## APIs and validation

Use the existing typed request wrapper and preserve its authentication, loading, duplicate-request, and error-handling behavior. Keep API functions aligned with their consumer-facing feature boundary.

For Vue or TypeScript changes, run the narrowest relevant lint check and `pnpm type-check` when the dependency tree permits it. Do not start a development server by default.
