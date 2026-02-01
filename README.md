# Todo App

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
- **dnd-kit** - Drag-and-drop functionality (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- **Motion** - Smooth animations (Framer Motion)
- **React Router** - Client-side routing
- **Jest + React Testing Library** - Unit and integration testing

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
| `npm run test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:verbose` | Run tests with verbose output |

## Project Structure

```
src/
├── components/         # React components
│   ├── Header.jsx          # App header with auth controls
│   ├── Login.jsx           # Login page
│   ├── MergePrompt.jsx     # Local/cloud todo merge dialog
│   ├── TodoInput.jsx       # New todo input form
│   ├── TodoItem.jsx        # Individual todo with drag handle
│   ├── TodoList.jsx        # Todo list with drag-and-drop
│   └── __tests__/          # Component tests
├── context/            # React context
│   ├── AuthContext.js      # Auth context definition
│   ├── AuthProvider.jsx    # Auth state provider
│   └── __tests__/          # Context tests
├── hooks/              # Custom hooks
│   ├── useAuth.js          # Authentication hook
│   ├── useTodos.js         # Todo management hook
│   └── __tests__/          # Hook tests
├── assets/             # Static assets (images, icons)
├── __mocks__/          # Jest mocks for external modules
├── __tests__/          # App-level tests
├── App.jsx             # Main app component
├── firebase.js         # Firebase configuration
├── index.css           # Global styles
├── main.jsx            # App entry point
└── setupTests.js       # Jest setup configuration
coverage/               # Test coverage reports (generated)
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

### Firebase Setup

This project uses a Firebase project with the configuration hardcoded in `src/firebase.js`. Here's how it was set up:

1. Created a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enabled **Authentication** and added Google as a sign-in provider

3. Created a **Firestore Database** in production mode

4. Copied the Firebase config object from the Firebase console into `src/firebase.js`

5. Deployed security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

6. Deployed the app:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Testing

This project uses **Jest** and **React Testing Library** for unit and integration testing.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run with verbose output
npm run test:verbose
```

### Test Structure

- **Component tests** - Located in `src/components/__tests__/`
- **Hook tests** - Located in `src/hooks/__tests__/`
- **Context tests** - Located in `src/context/__tests__/`
- **App tests** - Located in `src/__tests__/`
- **Mocks** - External module mocks in `src/__mocks__/`

### Coverage

Coverage reports are generated in the `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view detailed coverage information.
