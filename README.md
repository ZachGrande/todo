# Todo App

A todo list application built with React and Firebase. Features sorting (drag & drop), Google OAuth, and cloud sync.

## Features

- ✅ Add, complete, and delete todos
- 🔄 Drag & drop sorting with `dnd-kit`
- 🔐 Google sign-in (with Firebase Authentication)
- ☁️ Cloud sync (persist todos with Firestore)
- 💾 Local storage backs up logged-out todos
- 🔀 Merge local & cloud todos upon sign-in

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Firebase** - Authentication and Firestore database
- **dnd-kit** - Drag-and-drop functionality
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ZachGrande/todo.git
   cd todo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/     # React components
│   ├── Header.jsx      # App header with auth controls
│   ├── Login.jsx       # Login page
│   ├── MergePrompt.jsx # Local/cloud todo merge dialog
│   ├── TodoInput.jsx   # New todo input form
│   ├── TodoItem.jsx    # Individual todo with drag handle
│   └── TodoList.jsx    # Todo list with drag-and-drop
├── context/        # React context
│   ├── AuthContext.js  # Auth context definition
│   └── AuthProvider.jsx # Auth state provider
├── hooks/          # Custom hooks
│   ├── useAuth.js      # Authentication hook
│   └── useTodos.js     # Todo management hook
├── App.jsx         # Main app component
├── firebase.js     # Firebase configuration
├── index.css       # Global styles
└── main.jsx        # App entry point
```

## Firebase

This app uses Firebase for authentication and data persistence.

### Services Used

- **Firebase Authentication** - Google OAuth sign-in
- **Cloud Firestore** - NoSQL database for storing todos
- **Firebase Hosting** - Production deployment (configured in `firebase.json`)

### Data Structure

Todos are stored in Firestore with the following structure:

```
users/
└── {userId}/
    └── todos/
        └── {todoId}/
            ├── text: string
            ├── completed: boolean
            ├── order: number
            └── createdAt: timestamp
```

### Security Rules

Firestore security rules ensure users can only access their own data:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own todos
    match /users/{userId}/todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Key security features:**

- Requires authentication (`request.auth != null`)
- User isolation - users can only access documents under their own `userId` path
- No public access to any data
