# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server, http://localhost:5173
npm run build    # production build to dist/ — run this after every change to verify nothing broke
npm run preview  # serve the production build locally
```

There is no test runner configured in this project (no Jest/Vitest/RTL, no `test` script in `package.json`). `npm run build` succeeding is the only automated verification available — treat it as the equivalent of a test suite pass/fail gate. `@tanstack/react-query` is listed in `package.json` but is **not actually used anywhere** in `src/` — every page fetches data with a plain `useState`/`useEffect` + service-call pattern (see below). Don't assume React Query hooks are the established data-fetching convention; match what's actually in the pages.

## Architecture

React 18 + Vite + Tailwind CSS, React Router v6, react-hook-form, Zustand for global state. No TypeScript.

### Data fetching pattern

Every API resource has a thin service module in `src/services/` (`propertyService.js`, `leadService.js`, `contractService.js`, `interactionService.js`, `userService.js`, `authService.js`) — each just wraps `api.js`'s shared axios instance with named methods (`getLeads`, `createLead`, etc.) and does `throw error.response?.data || error.message` on failure. Pages call these directly inside a `useEffect` + local `useState`, there is no shared query cache — each page re-fetches on mount. `src/services/api.js` holds the JWT request/response interceptors, including automatic access-token refresh on a 401 (see `api.js` for the refresh-token flow before touching auth-adjacent code).

### Error/success feedback — always use this, not ad-hoc UI

- `src/stores/toastStore.js` exports a plain `toast` object (`toast.success(msg)` / `toast.error(msg)` / `toast.warning(msg)`) callable from anywhere, including outside React components. `<ToastContainer />` is mounted once in `App.jsx`.
- `src/utils/errorMessage.js` exports `getFriendlyMessage(error, fallback)` — translates whatever a service call threw (DRF field errors, `{detail: ...}`, raw network-error strings, or known English Django/DRF/SimpleJWT stock phrases like "No active account found...") into a short Spanish string. **Never** render a raw caught error or a raw DRF error object directly in the UI — always route it through `getFriendlyMessage` first, then `toast.error(...)`.
- Every page that has forms already follows this pattern (`Login.jsx`, `UserManagement.jsx`, `Leads.jsx`, `Contracts.jsx`, etc.) — copy that pattern for new pages rather than inventing inline error `<div>`s or `alert()`.

### Auth & route guarding

`useAuthStore` (`src/stores/authStore.js`) holds `user`/`isAuthenticated` and the login/logout/refreshUser actions; tokens live in `localStorage` (read directly by `api.js`, not through the store). Three route-guard components in `src/components/Common/`, in increasing strictness:
- `ProtectedRoute` — any authenticated user
- `AgentRoute` — `is_staff` or `role` in `agent`/`admin`
- `AdminRoute` — `is_staff` or `role === 'admin'`

`App.jsx` also wraps every route in `RequirePasswordChangeGate`, which redirects to `/set-password` whenever `user.must_change_password` is true — this is a UX convenience only, the backend enforces the same rule at the API level regardless of what the frontend does (see the backend repo's CLAUDE.md).

There is no self-service `/register` page — this is a private site. Accounts are created by an admin from `/admin/users` (`UserManagement.jsx`, calls the backend's `admin-create-user` endpoint) or Google Sign-In (`GoogleSignInButton.jsx`, Google Identity Services script loaded lazily — see the module-level `googleScriptPromise` singleton in that file if you touch it; a naive re-implementation will race under React StrictMode's double-invoked effects, which is exactly the bug that pattern exists to avoid).

### Typography & design tokens

`tailwind.config.js` defines `fontFamily.serif` (Playfair Display) and `fontFamily.sans` (Inter) — use the Tailwind classes `font-serif`/`font-sans`, not arbitrary values like `font-['Playfair_Display']`. Page `<h1>` titles use `font-serif font-bold`; body text and card sub-headings use the default sans stack. Brand colors are the `gold`/`silver` scales in the same config, plus the near-black `#1a1a1a` used directly as an arbitrary value for primary text (not yet tokenized).

### Branches

`prod` is the default/production branch (renamed from `master`). `dev` is active development. `qa` exists for pre-production validation. No CI/CD configured — promotion between branches is a manual `git merge`.

### Related repo

The Django backend lives in a separate sibling repo/checkout at `../backend` (not a git submodule — just adjacent on disk in local dev). `VITE_API_URL` in `.env` must point at that backend's `/api` base URL. The backend repo's own `CLAUDE.md` documents its authorization patterns, audit logging, and the private-site auth model this frontend's login/user-management pages are built against.
