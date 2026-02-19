# Copilot Instructions

## Architecture Overview

React 19 SPA with dual-mode storage: **Firestore for authenticated users**, **localStorage for anonymous users**. The `useTodos` hook abstracts both modes transparently—components never know which storage backend is active.

**Auth flow**: `AuthProvider` → `AuthContext` → `useAuth` hook → `useTodos` hook. On sign-in, if local todos exist, `useTodos` triggers a `MergePrompt` to reconcile local and cloud data.

**Firestore data structure**: `users/{uid}/todos/{todoId}` — each user owns a subcollection.

**Todo shape**: `{ id, text, completed, createdAt: number, order: number }`. The `order` field is the source of truth for manual sort position (not array index). New todos get `maxOrder + 1`; reordering via DnD patches `order` on all affected documents using a `writeBatch`.

## Key Files

- [src/hooks/useTodos.js](src/hooks/useTodos.js) — Central data layer; all CRUD + merge logic lives here
- [src/context/AuthProvider.jsx](src/context/AuthProvider.jsx) — Firebase Auth subscription, exposes `{ user, loading, signInWithGoogle, logout }`
- [src/App.jsx](src/App.jsx) — Wires `useTodos` to components; owns input/error state
- [src/__mocks__/firebase.js](src/__mocks__/firebase.js) — Automatic Jest mock for `../firebase` imports

## Developer Workflows

```bash
npm run dev          # Vite dev server → http://localhost:5173
npm run test         # Jest (jsdom)
npm run test:watch   # Watch mode
npm run test:coverage  # Coverage report; must meet 80% threshold
npm run lint         # ESLint
npm run build        # Vite production build
```

Config files use `.cjs` extension (`jest.config.cjs`, `babel.config.cjs`) because `package.json` sets `"type": "module"`.

## Testing Patterns

Firebase is mocked at two levels:
1. **Module-level auto-mock**: `src/__mocks__/firebase.js` intercepts `../firebase` imports automatically.
2. **Inline mock**: Tests that import from `firebase/firestore` or `firebase/analytics` directly must call `jest.mock('firebase/firestore', ...)` in the test file.

Auth state is injected via `AuthContext.Provider` directly (bypassing `AuthProvider`) so tests control `{ user, loading }`:

```js
const createWrapper = (user = null, loading = false) => ({ children }) => (
  <AuthContext.Provider value={{ user, loading, signInWithGoogle: jest.fn(), logout: jest.fn() }}>
    {children}
  </AuthContext.Provider>
);
```

Use `waitFor(() => expect(result.current.loading).toBe(false))` before asserting hook output—`useTodos` loading resolves asynchronously.

## Component Patterns

**Drag-and-drop** (`@dnd-kit`): Interactive elements inside draggable `TodoItem` must call `e.stopPropagation()` on `onPointerDown` to prevent DnD from consuming the event:
```jsx
<button onClick={onDelete} onPointerDown={(e) => e.stopPropagation()} />
```

**Animations**: Use `motion` from `motion/react` (not `framer-motion`). Wrap lists in `<AnimatePresence mode="popLayout">` for enter/exit transitions.

**Analytics**: Call `logEvent(analytics, 'event_name', { ... })` for user actions. Both logged-in and anonymous paths log `create_todo`; anonymous uses `user_id: 'anonymous'`.

## Loading State

`useTodos` exposes `loading = authLoading || loadedUserId !== currentUserId`. The `loadedUserId` state tracks data loading per-user: `undefined` = not yet loaded, `null` = loaded for anonymous, `string` = loaded for that UID. `App.jsx` renders a full-screen spinner while `loading` is true.
