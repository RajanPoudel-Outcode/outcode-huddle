# React Native App Refactor — Service Layer, Global API Wrapper & Error Handling

**Date:** 2026-06-21
**Status:** Approved (design)
**Scope:** `ecommerce-app` (Expo / React Native, expo-router, Redux Toolkit)

## Problem

The app was built as a learning exercise, so service-layer logic lives inside UI
screens. Concretely:

- `app/(auth)/login.tsx` and `app/(auth)/register.tsx` each declare an inline
  `UserData` interface, call `networkService.post` directly, manually persist
  tokens, dispatch Redux actions, and map errors with brittle
  `err.message.includes("...")` string matching.
- The network service strips every API response down to `.data`, discarding the
  backend's `success`, `message`, and `meta` envelope. The UI therefore cannot
  show the server's success/error `message`.
- There is no typed, reusable API response wrapper even though every backend
  response uses the same envelope.

The project's own `BEST_PRACTICES.md` already describes the target architecture
(feature modules, Redux `createAsyncThunk`, per-feature API services, centralized
error handling). This refactor brings the code in line with that document and
adds the global API wrapper + centralized message handling the user requested.

**Hard constraint:** do not break the current auth flow (onboarding → login/
register → tabs, session restore on launch, logout).

## Backend response contract

Success:

```json
{
  "success": true,
  "message": "User signed in successfully",
  "data": { "id": "...", "name": "...", "email": "...", "token": { "access_token": "...", "refresh_token": "..." }, "...": "..." },
  "meta": { "copyright": "...", "site": "...", "emails": ["..."], "api": { "version": 1 } }
}
```

Error:

```json
{
  "message": "Invalid email or password",
  "status_code": 401,
  "error": true,
  "path": "/api/auth/signIn",
  "method": "POST",
  "stack": "...",
  "meta": { "...": "..." }
}
```

The UI shows success messages from `message` and error messages from `message`.

## Goals

1. Extract all service/API logic out of screens into a feature service layer.
2. Introduce a typed global `ApiResponse<T>` wrapper used by every API call.
3. Centralize exception handling and user-facing message extraction.
4. Keep the existing auth flow working end to end.

## Non-Goals (YAGNI)

- Refactoring placeholder screens (`index`, `cart`, `orders`) — they contain no
  API logic.
- A global Snackbar/toast provider — per-screen error state is retained by
  decision; screens may use the existing `Snackbar` component for success.
- Mass-migrating `components/`, `constants/theme/`, `utils/`, `store/`,
  `hooks/` into a `shared/` directory — high churn, no functional gain, and
  raises the risk of breaking the flow. Core stays where it is; only new domain
  code is feature-based.
- Test harness setup (none exists today). Noted as a follow-up.

## Architecture

### Folder structure

```
features/
  auth/
    services/
      auth.service.ts      # pure API calls -> ApiResponse<AuthData>
      auth.storage.ts      # token + user persistence (wraps storageService)
    hooks/
      useAuth.ts           # state + signIn/signUp/logout/restoreSession
    types/
      auth.types.ts        # AuthUser, AuthTokens, AuthData, SignIn/SignUp payloads
types/
  api.types.ts             # ApiResponse<T>, ApiMeta, ApiErrorResponse (global)
services/                  # UNCHANGED location (core infra)
  network.service.ts       # now returns ApiResponse<T>
  storage.service.ts
store/slices/
  authSlice.ts             # createAsyncThunk + extraReducers
app/                       # expo-router screens stay here; become thin
```

Expo-router requires route files to live under `app/`, so screens are not moved
into the feature folder. They become thin consumers of `useAuth`.

### 1. Global API wrapper — `types/api.types.ts`

```ts
export interface ApiMeta {
  copyright?: string;
  site?: string;
  emails?: string[];
  api?: { version: number };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  message: string;
  status_code: number;
  error: boolean;
  path?: string;
  method?: string;
  meta?: ApiMeta;
}
```

### 2. `network.service.ts` changes

- `get/post/put/patch/delete<T>` now resolve to `ApiResponse<T>` (currently they
  resolve to `T` after stripping `.data`).
- `makeRequest<T>` parses the body as `ApiResponse<T>`; the cached value and the
  returned value are the full envelope.
- Error path: when `body.error === true` or `!response.ok`, throw an `ApiError`
  built from `body.message`, `body.status_code ?? response.status`, plus
  `path`/`method` context. `ApiError.userMessage` is set to `body.message` so the
  backend message is authoritative.
- Cache: `getCache`/`setCache` now store/return `ApiResponse<T>`. (Cache keys are
  per-URL, so no migration concern in practice; stale-shape entries simply
  resolve to a typed wrapper.)
- This is the single breaking contract change. The only current callers are
  `login.tsx` and `register.tsx`, both rewritten in this refactor.

### 3. Auth feature

`features/auth/types/auth.types.ts`

```ts
export interface AuthTokens { access_token: string; refresh_token: string }
export interface AuthData {           // shape of `data` from /auth/signIn|signUp
  id: string; name: string; email: string; address?: string;
  type: string; image?: string; token: AuthTokens;
  createdAt: string; updatedAt: string;
}
export interface AuthUser { id: string; email: string; name: string; avatar?: string }
export interface SignInPayload { email: string; password: string }
export interface SignUpPayload { firstName: string; lastName: string; email: string; password: string }
```

`features/auth/services/auth.service.ts` — pure API, no Redux, no storage:

```ts
export const authService = {
  signIn: (payload: SignInPayload) =>
    networkService.post<AuthData>("/auth/signIn", payload, { cache: false, retryCount: 1 }),
  signUp: (payload: SignUpPayload) =>
    networkService.post<AuthData>("/auth/signUp", payload, { cache: false, retryCount: 1 }),
};
```

`features/auth/services/auth.storage.ts` — centralizes persistence and fixes the
double-encoding bug (today `login.tsx` calls `JSON.stringify(user)` then
`storageService.setItem`, which stringifies again):

```ts
const KEYS = { token: "authToken", refresh: "authRefreshToken", user: "authUser" };
export const authStorage = {
  save: async (user: AuthUser, tokens: AuthTokens) => { /* setItem object once */ },
  restore: async (): Promise<{ user: AuthUser; token: string } | null> => { /* read object */ },
  clear: async () => { /* removeItem x3 */ },
};
```

`store/slices/authSlice.ts` — thunks orchestrate service + storage; reducers hold
state:

```ts
export const signIn = createAsyncThunk("auth/signIn",
  async (payload: SignInPayload, { rejectWithValue }) => {
    try {
      const res = await authService.signIn(payload);          // ApiResponse<AuthData>
      const user = { id: res.data.id, email: res.data.email, name: res.data.name };
      await authStorage.save(user, res.data.token);
      return { user, token: res.data.token.access_token, message: res.message };
    } catch (err) {
      return rejectWithValue(ErrorHandler.getUserMessage(err)); // backend message verbatim
    }
  });
// signUp: same shape. restoreSession: reads authStorage. logout: clears storage.
// extraReducers: pending -> isLoading true, error null;
//                fulfilled -> user/token set, isLoading false;
//                rejected  -> error = payload, isLoading false.
```

`features/auth/hooks/useAuth.ts` — UI-facing facade:

```ts
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(s => s.auth);
  return {
    user, isAuthenticated, isLoading, error,
    signIn: (p: SignInPayload) => dispatch(signIn(p)).unwrap(),   // resolves to {user, message}
    signUp: (p: SignUpPayload) => dispatch(signUp(p)).unwrap(),
    logout: () => dispatch(logout()),
  };
}
```

### 4. Error handling

- `ErrorHandler.getUserMessage` remains the single mapping point. For `ApiError`
  it returns `userMessage` (the backend `message`); network/timeout errors get
  friendly fallbacks; unknown errors get a generic message.
- Screens no longer string-match on `err.message`. They render `auth.error` from
  Redux (per-screen, existing pattern), now populated by the centralized mapping.

### 5. Screen rewrites

- `login.tsx` / `register.tsx`: keep all UI, styles, and field-level validation
  (`Validators`). Replace the inline interface + `networkService` + storage +
  error string-matching with a single `useAuth().signIn/signUp` call. On success,
  optionally show `res.message` via the existing `Snackbar`; navigation
  (`router.replace("/(tabs)")`) is unchanged (or driven by `_layout` auth effect).
- `profile.tsx`: replace manual `storageService.removeItem` calls with
  `useAuth().logout()`.
- `app/_layout.tsx`: replace ad-hoc restore (and the `JSON.parse` workaround) with
  `dispatch(restoreSession())` using `authStorage`.

## Data flow (sign in)

```
LoginScreen --useAuth().signIn(payload)--> signIn thunk
  thunk --> authService.signIn --> networkService.post --> ApiResponse<AuthData>
  thunk --> authStorage.save(user, tokens)
  thunk fulfilled --> authSlice sets user/token, isAuthenticated=true
  _layout auth effect --> router.replace("/(tabs)")
  (error) thunk rejected --> auth.error set --> screen renders message inline
```

## Error handling summary

| Source | Mapped by | Shown as |
| --- | --- | --- |
| API `{ error: true, message }` | `networkService` -> `ApiError` -> `ErrorHandler.getUserMessage` | `auth.error` inline (verbatim backend message) |
| Network/timeout | `ErrorHandler.getUserMessage` | friendly fallback inline |
| Field validation | `Validators` (unchanged) | per-field error text |
| Success | thunk returns `res.message` | optional per-screen `Snackbar` |

## Testing / verification

No automated test harness exists. Verification is manual against the running app:

1. Sign in with valid credentials → lands on tabs, token persisted.
2. Sign in with invalid credentials → inline message "Invalid email or password".
3. Register new user → lands on tabs.
4. Kill & relaunch app → session restored (no double-encode error).
5. Logout from profile → returns to login, storage cleared.
6. TypeScript: `npx tsc --noEmit` clean; `expo lint` clean.

Adding a Jest + RTL harness (per `BEST_PRACTICES.md`) is a recommended follow-up.

## Risks & mitigations

- **Breaking change to `networkService` return type** → only two callers, both
  rewritten here; `tsc` will catch any miss.
- **Cache shape change** → keys are per-URL; new writes store the wrapper; no
  runtime migration needed.
- **Session-restore regression** → covered by manual verification step 4.
