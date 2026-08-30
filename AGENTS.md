# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Project

Mall H5 is a consumer-facing mobile storefront built with Vue 3.5, TypeScript, Vite 8, Vant 4, Pinia, Axios, and UnoCSS. It uses pnpm (`>= 11`) and Node (`>= 24`). There is no automated test suite; validate changes with the relevant lint and type checks.

## Commands

```bash
pnpm dev            # start the development server with .env.dev
pnpm dev:test       # start against .env.test
pnpm dev:prod       # start against .env.prod
pnpm preview        # preview the latest production build
pnpm type-check     # run vue-tsc --build
pnpm lint           # run ESLint
pnpm lint:fix       # run ESLint with fixes
pnpm build          # type-check and build for production
pnpm build:test     # type-check and build for test
pnpm commit         # create a Conventional Commit with czg
```

Commits are checked by commitlint, and the Husky pre-commit hook runs lint-staged (`eslint --fix`). Follow the existing Conventional Commit style.

## Environment and build

`.env` contains shared settings, including `VITE_APP_NAME`, `VITE_HOME_PATH`, `VITE_APP_PREFIX`, and `VITE_COMPRESSION`. `.env.dev`, `.env.test`, and `.env.prod` provide `VITE_BASE_URL`.

Vite uses the `@` alias for `src`, a relative build base (`./`), and hash routing. `build/plugins.ts` configures Vue, Vue JSX, UnoCSS, optional compression, Vue DevTools, and writes `version.json` from `package.json` during builds. `src/config/versionRocket.ts` checks that file for deployed-version updates.

## Architecture

### Application shell and UI

`src/main.ts` installs Pinia, Vue Router, and Vant before mounting the app. The main layout is `src/layout/index.vue`, which provides the shared `AppNavBar`, page `<router-view>`, and `AppTabbar`.

Use Vant components and APIs (`van-*`, `showToast`, `showLoadingToast`, etc.) for interface work. Do not introduce Element Plus or desktop administration UI patterns. Build mobile-first pages that account for touch interactions, scrolling, and safe-area space for the fixed tab bar.

UnoCSS is configured in `uno.config.ts` with Wind3, Attributify, and shared shortcuts. Global styles live in `src/styles/`; retain the existing CSS variables and styling conventions instead of adding arbitrary global CSS.

### Routing

All routes are static and use hash history. `src/router/index.ts` mounts `src/router/modules/tabbar.ts` and every other route module in `src/router/modules/` except `tabbar.ts` and `remainingRouter.ts` under the `Layout` route. `remainingRouter.ts` contains routes outside the layout, such as login and the catch-all route.

Add a business page by creating a module under `src/router/modules/` that `export default satisfies RouteRecordRaw`. Keep tab-bar routes in `tabbar.ts`; `AppTabbar` reads their `name`, `meta.title`, and `meta.icon`. Route metadata currently supports `title`, optional `icon`, and optional `keepAlive` as declared in `src/typings/router.d.ts`.

The navigation guard only enforces the user token: unauthenticated users are redirected to `/login`, and authenticated users visiting `/login` are redirected to `VITE_HOME_PATH`. Do not add backend-driven menus, permission routing, breadcrumbs, or admin tabs without an explicit requirement.

### State

Pinia is installed with `pinia-plugin-persistedstate` in `src/stores/index.ts`. The current shared store is `src/stores/user.ts`; it persists `accessToken` through VueUse `useStorage` and keeps user data in a resettable local state object.

Keep transient page state in components. Add Pinia state only when it is shared between pages, such as shopper identity or cart state.

### HTTP layer

All API calls use the default `request` export from `src/utils/axios/`. API functions currently live in `src/api/index.ts`; follow its typed function pattern and keep feature APIs grouped coherently as the application grows.

The Axios wrapper uses `VITE_BASE_URL`, adds the Bearer token and `Accept-Language`, serializes query arrays with repeated keys, removes empty values, deduplicates requests by default, and can show Vant loading/toast feedback. It normalizes network, HTTP, and business failures into `RequestError`; HTTP or business code `401` clears the session and redirects to login. Backend success is business code `200`.

```ts
export function submitOrder(data: SubmitOrderRequest) {
  return request<Order>({
    url: '/api/orders',
    method: 'post',
    data,
  }, {
    loading: true,
    successMessage: true,
  });
}
```

Request options are `cancelDuplicateRequest`, `loading`, `successMessage`, and `errorMessage`. Do not bypass the wrapper or duplicate its auth, loading, deduplication, or error-handling behavior.

## Conventions

- Vue SFCs use `<script setup lang="ts">` and explicit imports; this project does not configure Vue, Vant, Pinia, or Vue Router auto-imports.
- Use precise TypeScript types. Shared ambient types belong in `src/typings/`.
- ESLint uses `@antfu/eslint-config`, semicolons, UnoCSS linting, and Prettier-based CSS/HTML formatting. Run `pnpm lint:fix` for modified frontend files before committing when practical.
- Prefer existing helpers in `src/utils/`. `numberFormat` formats integers with thousands separators, while `moneyThousand` formats monetary values to two decimal places and `moneyCN` converts monetary values to Chinese text.
- Preserve the typed request contract. Do not invent API paths, payload fields, product prices, inventory, payment behavior, or user data shapes; find the established API/type contract first.
- Before delivery, inspect the diff and run the narrowest relevant validation. For Vue or TypeScript changes, use lint and `pnpm type-check` when dependencies permit.
