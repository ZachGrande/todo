# Todo Application - UML Documentation (Mermaid)

## Overview

This is a React-based Todo application with Firebase authentication and Firestore for cloud storage. The app supports both authenticated (cloud-synced) and anonymous (local storage) modes.

---

## Class Diagram

```mermaid
classDiagram
    direction TB
    
    %% Firebase Layer
    class Firebase {
        +app: FirebaseApp
        +auth: Auth
        +db: Firestore
        +googleProvider: GoogleAuthProvider
    }
    
    %% Context Layer
    class AuthContext {
        <<Context>>
    }
    
    class AuthProvider {
        -user: User | null
        -loading: boolean
        +signInWithGoogle() Promise~void~
        +logout() Promise~void~
    }
    
    %% Hooks Layer
    class useAuth {
        <<Hook>>
        +user: User | null
        +loading: boolean
        +signInWithGoogle()
        +logout()
    }
    
    class useTodos {
        <<Hook>>
        -todos: Todo[]
        -loading: boolean
        -showMergePrompt: boolean
        -localTodosToMerge: Todo[]
        +addTodo(text) Promise~void~
        +toggleComplete(id) Promise~void~
        +deleteTodo(id) Promise~void~
        +reorderTodos(activeId, overId)
        +handleMergeKeepBoth()
        +handleMergeUseCloud()
        +handleMergeUseLocal()
        +dismissMergePrompt()
    }
    
    %% Components
    class App {
        -inputValue: string
        -error: string
        +handleSubmit(e) void
        +handleInputChange(e) void
    }
    
    class Header {
        +handleSignOut() void
    }
    
    class Login {
        +handleGoogleSignIn() Promise~void~
    }
    
    class TodoInput {
        <<Props>>
        +inputValue: string
        +onInputChange: function
        +onSubmit: function
        +error: string
    }
    
    class TodoList {
        <<Props>>
        +todos: Todo[]
        +onToggle: function
        +onDelete: function
        +onReorder: function
    }
    
    class TodoItem {
        <<Props>>
        +todo: Todo
        +onToggle: function
        +onDelete: function
    }
    
    class MergePrompt {
        <<Props>>
        +localCount: number
        +cloudCount: number
        +onKeepBoth: function
        +onUseCloud: function
        +onUseLocal: function
        +onDismiss: function
    }
    
    %% Data Models
    class Todo {
        +id: string
        +text: string
        +completed: boolean
        +createdAt: number
        +order: number
    }
    
    class User {
        +uid: string
        +displayName: string
        +photoURL: string
        +email: string
    }
    
    %% Relationships
    AuthProvider --> Firebase : uses
    AuthProvider --> AuthContext : provides
    useAuth --> AuthContext : consumes
    useTodos --> useAuth : uses
    useTodos --> Firebase : uses
    
    App --> useTodos : uses
    App --> Header : renders
    App --> TodoInput : renders
    App --> TodoList : renders
    App --> MergePrompt : renders
    
    Header --> useAuth : uses
    Login --> useAuth : uses
    
    TodoList --> TodoItem : renders
    
    useTodos --> Todo : manages
    AuthProvider --> User : manages
```

---

## Data Models

```mermaid
erDiagram
    USER ||--o{ TODO : owns
    
    USER {
        string uid PK
        string displayName
        string photoURL
        string email
    }
    
    TODO {
        string id PK
        string text
        boolean completed
        number createdAt
        number order
        string userId FK
    }
```

---

## Component Hierarchy

```mermaid
graph TD
    subgraph Entry["main.jsx"]
        SM[StrictMode]
    end
    
    SM --> AP[AuthProvider]
    AP --> BR[BrowserRouter]
    BR --> Routes
    
    Routes --> R1["Route '/'"]
    Routes --> R2["Route '/login'"]
    
    R1 --> App
    R2 --> Login
    
    App --> Header
    App --> TodoInput
    App --> TodoList
    App --> MergePrompt
    
    TodoList --> TI1[TodoItem]
    TodoList --> TI2[TodoItem]
    TodoList --> TIn[TodoItem ...]
    
    style Entry fill:#1a1a2e
    style App fill:#16213e
    style Login fill:#16213e
```

---

## Sequence Diagrams

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Login
    participant useAuth
    participant AuthProvider
    participant Firebase
    
    User->>Login: Click "Continue with Google"
    Login->>useAuth: signInWithGoogle()
    useAuth->>AuthProvider: signInWithGoogle()
    AuthProvider->>Firebase: signInWithPopup(auth, googleProvider)
    Firebase-->>AuthProvider: User credential
    Firebase->>AuthProvider: onAuthStateChanged(user)
    AuthProvider->>AuthProvider: setUser(user)
    AuthProvider-->>useAuth: user object
    useAuth-->>Login: success
    Login->>Login: navigate('/')
    Login-->>User: Redirect to Home
```

### 2. Add Todo Flow (Authenticated User)

```mermaid
sequenceDiagram
    actor User
    participant App
    participant TodoInput
    participant useTodos
    participant Firestore
    
    User->>App: Type todo text
    App->>TodoInput: handleInputChange(e)
    TodoInput-->>App: setInputValue(text)
    
    User->>App: Click "Add"
    App->>TodoInput: handleSubmit(e)
    TodoInput->>useTodos: addTodo(text)
    
    useTodos->>Firestore: addDoc(todosRef, newTodo)
    Firestore-->>useTodos: Document reference
    
    Firestore->>useTodos: onSnapshot (updated todos)
    useTodos->>useTodos: setTodos(firestoreTodos)
    useTodos-->>App: Re-render with new todo
    App-->>User: UI Updated
```

### 3. Data Merge Flow (User Signs In with Local Todos)

```mermaid
sequenceDiagram
    actor User
    participant App
    participant useTodos
    participant localStorage
    participant Firestore
    
    User->>App: Sign In
    
    useTodos->>localStorage: getLocalTodos()
    localStorage-->>useTodos: localTodos[]
    
    useTodos->>Firestore: onSnapshot(query)
    Firestore-->>useTodos: firestoreTodos[]
    
    useTodos->>useTodos: Check localTodos.length > 0
    useTodos->>useTodos: setShowMergePrompt(true)
    useTodos-->>App: Show MergePrompt
    
    App-->>User: Display merge options
    
    User->>App: Choose "Keep Both"
    App->>useTodos: handleMergeKeepBoth()
    
    useTodos->>Firestore: writeBatch (add local todos)
    Firestore-->>useTodos: Success
    
    useTodos->>localStorage: clearLocalTodos()
    useTodos->>useTodos: setShowMergePrompt(false)
    
    useTodos-->>App: Re-render
    App-->>User: UI Updated with merged todos
```

---

## State Diagram - Todo Item

```mermaid
stateDiagram-v2
    [*] --> Incomplete: addTodo()
    
    Incomplete --> Complete: toggleComplete()
    Complete --> Incomplete: toggleComplete()
    
    Incomplete --> [*]: deleteTodo()
    Complete --> [*]: deleteTodo()
    
    state Incomplete {
        [*] --> NotCompleted
        NotCompleted: completed = false
    }
    
    state Complete {
        [*] --> Completed
        Completed: completed = true
    }
```

---

## Activity Diagram - Application Initialization

```mermaid
flowchart TD
    A[Start] --> B[Initialize Firebase App]
    B --> C[AuthProvider Mounted]
    C --> D[Subscribe to onAuthStateChanged]
    D --> E{Auth State Determined?}
    
    E -->|User Signed In| F[Connect Firestore Listener]
    E -->|No User| G[Load localStorage Todos]
    
    F --> H{Local Todos Exist?}
    H -->|Yes| I[Show Merge Prompt]
    H -->|No| J[Load Firestore Todos]
    
    I --> K[User Chooses Merge Option]
    K --> J
    
    G --> L[Set Todos from localStorage]
    J --> M[Set Todos from Firestore]
    
    L --> N[Render App with Todos]
    M --> N
    
    N --> O[End]
    
    style A fill:#0d1117,stroke:#30363d
    style O fill:#0d1117,stroke:#30363d
    style I fill:#238636,stroke:#2ea043
```

---

## Deployment Diagram

```mermaid
C4Deployment
    title Deployment Diagram - Todo Application
    
    Deployment_Node(browser, "Client Browser", "Chrome, Firefox, Safari") {
        Container(spa, "React SPA", "React 18, Vite", "Single Page Application with Tailwind CSS styling")
        ContainerDb(local, "localStorage", "Browser API", "Offline todo storage")
    }
    
    Deployment_Node(firebase, "Firebase Platform", "Google Cloud") {
        Container(hosting, "Firebase Hosting", "CDN", "Static asset hosting with SPA routing")
        Container(auth, "Firebase Auth", "OAuth 2.0", "Google authentication provider")
        ContainerDb(firestore, "Cloud Firestore", "NoSQL", "User todos: /users/{uid}/todos")
    }
    
    Rel(spa, hosting, "Served from", "HTTPS")
    Rel(spa, auth, "Authenticates via", "Firebase SDK")
    Rel(spa, firestore, "Reads/Writes", "Firebase SDK")
    Rel(spa, local, "Stores offline", "Web API")
```

---

## Architecture Overview

```mermaid
graph TB
    subgraph Client["Client Browser"]
        subgraph React["React Application"]
            Components[Components Layer]
            Hooks[Hooks Layer]
            Context[Context Layer]
        end
        LS[(localStorage)]
    end
    
    subgraph Firebase["Firebase Platform"]
        FH[Firebase Hosting]
        FA[Firebase Auth]
        FS[(Cloud Firestore)]
    end
    
    Components --> Hooks
    Hooks --> Context
    Hooks --> LS
    Context --> FA
    Hooks --> FS
    FH --> React
    
    style Client fill:#1a1a2e,stroke:#e94560
    style Firebase fill:#0f3460,stroke:#e94560
    style React fill:#16213e,stroke:#0f3460
```

---

## Technology Stack

```mermaid
mindmap
  root((Todo App))
    Frontend
      React 19
      Vite
      Tailwind CSS 4
      React Router v7
    Drag & Drop
      @dnd-kit/core
      @dnd-kit/sortable
      @dnd-kit/utilities
    Animations
      Motion
        Framer Motion
    Backend Services
      Firebase Auth
        Google OAuth
      Cloud Firestore
        NoSQL Database
      Firebase Hosting
        CDN
    Storage
      localStorage
        Offline Mode
    Testing
      Jest
      React Testing Library
```

---

## File Structure

```mermaid
graph LR
    subgraph src["/src"]
        main["main.jsx<br/>(Entry Point)"]
        app["App.jsx<br/>(Root Component)"]
        fb["firebase.js<br/>(Config)"]
        css["index.css<br/>(Styles)"]
        
        subgraph context["/context"]
            ac["AuthContext.js"]
            ap["AuthProvider.jsx"]
        end
        
        subgraph hooks["/hooks"]
            ua["useAuth.js"]
            ut["useTodos.js"]
        end
        
        subgraph components["/components"]
            hd["Header.jsx"]
            lg["Login.jsx"]
            ti["TodoInput.jsx"]
            tl["TodoList.jsx"]
            tm["TodoItem.jsx"]
            mp["MergePrompt.jsx"]
        end
    end
    
    main --> app
    app --> components
    components --> hooks
    hooks --> context
    context --> fb
    
    style src fill:#1a1a2e
    style context fill:#16213e
    style hooks fill:#16213e
    style components fill:#16213e
```

---

## User Flow

```mermaid
journey
    title User Journey - Todo Application
    section Anonymous User
      Visit App: 5: User
      Add Todo: 4: User
      Reorder Todos: 4: User
      Complete Todo: 5: User
      Delete Todo: 3: User
    section Sign In
      Click Sign In: 3: User
      Google OAuth: 4: User, Firebase
      Merge Prompt: 3: User
      Choose Merge Option: 4: User
    section Authenticated User
      Todos Synced: 5: User, Firestore
      Add Todo: 5: User, Firestore
      Sign Out: 3: User
```
