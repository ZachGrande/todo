# Todo Application - UML Documentation

## Overview

This is a React-based Todo application with Firebase authentication and Firestore for cloud storage. The app supports both authenticated (cloud-synced) and anonymous (local storage) modes.

---

## Class Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FIREBASE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐   ┌─────────────────────┐   ┌──────────────────┐  │
│  │     Firebase App    │   │   Firebase Auth     │   │    Firestore     │  │
│  │    (firebase.js)    │   │   (auth, provider)  │   │       (db)       │  │
│  └─────────────────────┘   └─────────────────────┘   └──────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONTEXT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         AuthProvider                                  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ - user: User | null                                                   │  │
│  │ - loading: boolean                                                    │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ + signInWithGoogle(): Promise<void>                                   │  │
│  │ + logout(): Promise<void>                                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│                                      │ provides                             │
│                                      ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         AuthContext                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               HOOKS LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────┐    ┌────────────────────────────────────┐  │
│  │         useAuth()          │    │            useTodos()               │  │
│  ├────────────────────────────┤    ├────────────────────────────────────┤  │
│  │ Returns:                   │    │ - todos: Todo[]                     │  │
│  │ - user: User | null        │    │ - loading: boolean                  │  │
│  │ - loading: boolean         │    │ - showMergePrompt: boolean          │  │
│  │ - signInWithGoogle()       │    │ - localTodosToMerge: Todo[]         │  │
│  │ - logout()                 │    ├────────────────────────────────────┤  │
│  └────────────────────────────┘    │ + addTodo(text): Promise<void>      │  │
│              │                     │ + toggleComplete(id): Promise<void> │  │
│              │ uses                │ + deleteTodo(id): Promise<void>     │  │
│              ▼                     │ + reorderTodos(activeId, overId)    │  │
│  ┌────────────────────────────┐    │ + handleMergeKeepBoth()             │  │
│  │      AuthContext           │    │ + handleMergeUseCloud()             │  │
│  └────────────────────────────┘    │ + handleMergeUseLocal()             │  │
│                                    │ + dismissMergePrompt()              │  │
│                                    └────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            COMPONENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                              App                                      │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ - inputValue: string                                                  │  │
│  │ - error: string                                                       │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ + handleSubmit(e): void                                               │  │
│  │ + handleInputChange(e): void                                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│          │                    │                    │                    │   │
│          ▼                    ▼                    ▼                    ▼   │
│  ┌─────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────┐  │
│  │   Header    │   │   TodoInput   │   │   TodoList    │   │MergePrompt│  │
│  ├─────────────┤   ├───────────────┤   ├───────────────┤   ├───────────┤  │
│  │Props:       │   │Props:         │   │Props:         │   │Props:     │  │
│  │- (none)     │   │- inputValue   │   │- todos        │   │-localCount│  │
│  │             │   │- onInputChange│   │- onToggle     │   │-cloudCount│  │
│  │Uses:        │   │- onSubmit     │   │- onDelete     │   │-onKeepBoth│  │
│  │- useAuth()  │   │- error        │   │- onReorder    │   │-onUseCloud│  │
│  │- useNavigate│   └───────────────┘   └───────────────┘   │-onUseLocal│  │
│  └─────────────┘                              │            │-onDismiss │  │
│                                               │            └───────────┘  │
│                                               ▼                            │
│                                      ┌───────────────┐                     │
│                                      │   TodoItem    │                     │
│                                      ├───────────────┤                     │
│                                      │Props:         │                     │
│                                      │- todo         │                     │
│                                      │- onToggle     │                     │
│                                      │- onDelete     │                     │
│                                      │               │                     │
│                                      │Uses:          │                     │
│                                      │- useSortable  │                     │
│                                      └───────────────┘                     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                             Login                                     │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ Uses:                                                                 │  │
│  │ - useAuth()                                                           │  │
│  │ - useNavigate()                                                       │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ + handleGoogleSignIn(): Promise<void>                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Todo

```
┌────────────────────────────────┐
│             Todo               │
├────────────────────────────────┤
│ + id: string                   │
│ + text: string                 │
│ + completed: boolean           │
│ + createdAt: number (timestamp)│
│ + order: number                │
└────────────────────────────────┘
```

### User (Firebase Auth)

```
┌────────────────────────────────┐
│             User               │
├────────────────────────────────┤
│ + uid: string                  │
│ + displayName: string          │
│ + photoURL: string             │
│ + email: string                │
└────────────────────────────────┘
```

---

## Component Hierarchy Diagram

```
main.jsx
    │
    └── StrictMode
            │
            └── AuthProvider
                    │
                    └── BrowserRouter
                            │
                            └── Routes
                                    │
                                    ├── Route "/" ──► App
                                    │                  │
                                    │                  ├── Header
                                    │                  ├── TodoInput
                                    │                  ├── TodoList
                                    │                  │       │
                                    │                  │       └── TodoItem (×n)
                                    │                  │
                                    │                  └── MergePrompt (conditional)
                                    │
                                    └── Route "/login" ──► Login
```

---

## Sequence Diagrams

### 1. User Authentication Flow

```
┌──────┐     ┌───────┐     ┌────────────┐     ┌─────────────┐     ┌──────────┐
│ User │     │ Login │     │ useAuth()  │     │AuthProvider │     │ Firebase │
└──┬───┘     └───┬───┘     └─────┬──────┘     └──────┬──────┘     └────┬─────┘
   │             │               │                    │                 │
   │  Click      │               │                    │                 │
   │  "Continue  │               │                    │                 │
   │  with       │               │                    │                 │
   │  Google"    │               │                    │                 │
   │────────────►│               │                    │                 │
   │             │               │                    │                 │
   │             │ signInWithGoogle()                 │                 │
   │             │──────────────►│                    │                 │
   │             │               │                    │                 │
   │             │               │ signInWithGoogle() │                 │
   │             │               │───────────────────►│                 │
   │             │               │                    │                 │
   │             │               │                    │ signInWithPopup │
   │             │               │                    │────────────────►│
   │             │               │                    │                 │
   │             │               │                    │◄────────────────│
   │             │               │                    │   user object   │
   │             │               │                    │                 │
   │             │               │                    │ onAuthStateChanged
   │             │               │                    │────────────────►│
   │             │               │                    │                 │
   │             │               │                    │ setUser(user)   │
   │             │               │                    │◄────────────────│
   │             │               │                    │                 │
   │             │◄──────────────│                    │                 │
   │             │  navigate('/') │                   │                 │
   │◄────────────│               │                    │                 │
   │  Redirect   │               │                    │                 │
   │  to Home    │               │                    │                 │
```

### 2. Add Todo Flow (Authenticated User)

```
┌──────┐     ┌─────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│ User │     │ App │     │ TodoInput │     │ useTodos  │     │ Firestore │
└──┬───┘     └──┬──┘     └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
   │            │              │                 │                  │
   │ Type text  │              │                 │                  │
   │───────────►│              │                 │                  │
   │            │              │                 │                  │
   │            │handleInputChange               │                  │
   │            │─────────────►│                 │                  │
   │            │              │                 │                  │
   │            │setInputValue │                 │                  │
   │            │◄─────────────│                 │                  │
   │            │              │                 │                  │
   │ Click Add  │              │                 │                  │
   │───────────►│              │                 │                  │
   │            │              │                 │                  │
   │            │ handleSubmit │                 │                  │
   │            │─────────────►│                 │                  │
   │            │              │                 │                  │
   │            │              │ addTodo(text)   │                  │
   │            │              │────────────────►│                  │
   │            │              │                 │                  │
   │            │              │                 │  addDoc(newTodo) │
   │            │              │                 │─────────────────►│
   │            │              │                 │                  │
   │            │              │                 │◄─────────────────│
   │            │              │                 │   doc reference  │
   │            │              │                 │                  │
   │            │              │                 │  onSnapshot      │
   │            │              │                 │◄─────────────────│
   │            │              │                 │  (updated list)  │
   │            │              │                 │                  │
   │            │  setTodos()  │                 │                  │
   │            │◄─────────────│─────────────────│                  │
   │            │              │                 │                  │
   │ UI Update  │              │                 │                  │
   │◄───────────│              │                 │                  │
```

### 3. Data Merge Flow (User Signs In with Local Todos)

```
┌──────┐     ┌─────┐     ┌──────────┐      ┌─────────────┐     ┌───────────┐
│ User │     │ App │     │ useTodos │      │ localStorage│     │ Firestore │
└──┬───┘     └──┬──┘     └────┬─────┘      └──────┬──────┘     └─────┬─────┘
   │            │             │                   │                  │
   │ Sign In    │             │                   │                  │
   │───────────►│             │                   │                  │
   │            │             │                   │                  │
   │            │             │ getLocalTodos()   │                  │
   │            │             │──────────────────►│                  │
   │            │             │                   │                  │
   │            │             │◄──────────────────│                  │
   │            │             │   localTodos[]    │                  │
   │            │             │                   │                  │
   │            │             │     onSnapshot()  │                  │
   │            │             │◄─────────────────────────────────────│
   │            │             │   firestoreTodos[]                   │
   │            │             │                   │                  │
   │            │             │ Compare:          │                  │
   │            │             │ localTodos.length > 0?               │
   │            │             │                   │                  │
   │            │setShowMergePrompt(true)         │                  │
   │            │◄────────────│                   │                  │
   │            │             │                   │                  │
   │ MergePrompt│             │                   │                  │
   │ displayed  │             │                   │                  │
   │◄───────────│             │                   │                  │
   │            │             │                   │                  │
   │ Choose     │             │                   │                  │
   │ "Keep Both"│             │                   │                  │
   │───────────►│             │                   │                  │
   │            │             │                   │                  │
   │            │handleMergeKeepBoth              │                  │
   │            │────────────►│                   │                  │
   │            │             │                   │                  │
   │            │             │ writeBatch()      │                  │
   │            │             │─────────────────────────────────────►│
   │            │             │                   │                  │
   │            │             │ clearLocalTodos() │                  │
   │            │             │──────────────────►│                  │
   │            │             │                   │                  │
   │ UI Update  │             │                   │                  │
   │◄───────────│             │                   │                  │
```

---

## State Diagram - Todo Item

```
                    ┌─────────────────┐
                    │                 │
                    │     Created     │
                    │                 │
                    └────────┬────────┘
                             │
                             │ addTodo()
                             ▼
              ┌──────────────────────────────┐
              │                              │
              │         Incomplete           │◄─────────────┐
              │      (completed: false)      │              │
              │                              │              │
              └──────────────┬───────────────┘              │
                             │                              │
                             │ toggleComplete()             │
                             ▼                              │
              ┌──────────────────────────────┐              │
              │                              │              │
              │          Complete            │──────────────┘
              │      (completed: true)       │  toggleComplete()
              │                              │
              └──────────────┬───────────────┘
                             │
                             │ deleteTodo()
                             ▼
                    ┌─────────────────┐
                    │                 │
                    │     Deleted     │
                    │                 │
                    └─────────────────┘
```

---

## Activity Diagram - Application Initialization

```
        ┌─────────────────┐
        │      Start      │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   Initialize    │
        │   Firebase App  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   AuthProvider  │
        │   Mounted       │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Subscribe to   │
        │onAuthStateChanged│
        └────────┬────────┘
                 │
                 ▼
       ┌─────────────────────┐
       │   Auth State        │
       │   Determined?       │
       └──────────┬──────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
   ┌───────────┐     ┌───────────┐
   │User Signed│     │  No User  │
   │    In     │     │  (null)   │
   └─────┬─────┘     └─────┬─────┘
         │                 │
         ▼                 ▼
   ┌───────────┐     ┌───────────┐
   │  Connect  │     │   Load    │
   │ Firestore │     │localStorage│
   │ Listener  │     │   Todos   │
   └─────┬─────┘     └─────┬─────┘
         │                 │
         ▼                 │
   ┌───────────┐           │
   │  Check    │           │
   │  Local    │           │
   │  Todos    │           │
   └─────┬─────┘           │
         │                 │
    ┌────┴────┐            │
    │         │            │
    ▼         ▼            │
┌───────┐ ┌───────┐        │
│ Has   │ │ No    │        │
│ Local │ │ Local │        │
│ Todos │ │ Todos │        │
└───┬───┘ └───┬───┘        │
    │         │            │
    ▼         │            │
┌───────┐     │            │
│ Show  │     │            │
│ Merge │     │            │
│ Prompt│     │            │
└───┬───┘     │            │
    │         │            │
    └────┬────┘            │
         │                 │
         └────────┬────────┘
                  │
                  ▼
        ┌─────────────────┐
        │   Render App    │
        │   with Todos    │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │       End       │
        └─────────────────┘
```

---

## Deployment Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Browser                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         React Application                            │  │
│   │                         (Built with Vite)                            │  │
│   │                                                                      │  │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │  │
│   │   │   React     │    │ React Router│    │     @dnd-kit/core      │ │  │
│   │   │   18.x      │    │     v7      │    │   (Drag & Drop)        │ │  │
│   │   └─────────────┘    └─────────────┘    └─────────────────────────┘ │  │
│   │                                                                      │  │
│   │   ┌─────────────────────────────────────────────────────────────┐   │  │
│   │   │                    Firebase SDK                              │   │  │
│   │   │   - firebase/app                                             │   │  │
│   │   │   - firebase/auth                                            │   │  │
│   │   │   - firebase/firestore                                       │   │  │
│   │   └─────────────────────────────────────────────────────────────┘   │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                         localStorage                                 │  │
│   │                    (Offline Todo Storage)                            │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Firebase Platform                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐   ┌─────────────────────────────────────────┐   │
│   │  Firebase Hosting   │   │           Firebase Auth                  │   │
│   │                     │   │       (Google OAuth Provider)            │   │
│   │  - Static Assets    │   │                                          │   │
│   │  - SPA Routing      │   └─────────────────────────────────────────┘   │
│   └─────────────────────┘                                                  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                       Cloud Firestore                                │  │
│   │                                                                      │  │
│   │   Collection: users/{userId}/todos                                   │  │
│   │                                                                      │  │
│   │   Document Structure:                                                │  │
│   │   {                                                                  │  │
│   │     text: string,                                                    │  │
│   │     completed: boolean,                                              │  │
│   │     createdAt: number,                                               │  │
│   │     order: number                                                    │  │
│   │   }                                                                  │  │
│   │                                                                      │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Routing | React Router v7 |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| Animations | Motion (Framer Motion) |
| Authentication | Firebase Auth (Google Provider) |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| Local Storage | Browser localStorage API |
| Testing | Jest, React Testing Library |

---

## File Structure Mapping

```
src/
├── main.jsx              → Application entry point
├── App.jsx               → Root component, orchestrates all features
├── firebase.js           → Firebase configuration & exports
├── index.css             → Global styles (Tailwind)
│
├── context/
│   ├── AuthContext.js    → React context for auth state
│   └── AuthProvider.jsx  → Provider component wrapping Firebase Auth
│
├── hooks/
│   ├── useAuth.js        → Hook to consume AuthContext
│   └── useTodos.js       → Hook for todo CRUD operations
│
└── components/
    ├── Header.jsx        → Navigation header with auth controls
    ├── Login.jsx         → Login page with Google sign-in
    ├── TodoInput.jsx     → Form for adding new todos
    ├── TodoList.jsx      → Sortable list container
    ├── TodoItem.jsx      → Individual draggable todo item
    └── MergePrompt.jsx   → Modal for merging local/cloud todos
```
