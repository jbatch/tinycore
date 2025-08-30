# TinyCore Todo App Example

A simple todo application built with React and TinyCore-KV to demonstrate how to use the `@jbatch/tinycore-client` package.

## Features

- ✅ User authentication (login/register)
- ✅ Create, read, update, delete todos
- ✅ Mark todos as complete/incomplete  
- ✅ Automatic application setup
- ✅ Real-time data persistence with TinyCore-KV
- ✅ Clean, responsive UI with Tailwind CSS

## Prerequisites

- Node.js (v18+ recommended)
- A running TinyCore-KV server (see [TinyCore repository](https://github.com/jbatch/tinycore))

## Quick Start

### 1. Set up the project

```bash
# Create a new Vite React app
npm create vite@latest tinycore-todo-example -- --template react-ts
cd tinycore-todo-example

# Install dependencies
npm install

# Install TinyCore client and other dependencies
npm install @jbatch/tinycore-client lucide-react

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind CSS

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. Add the CSS imports

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Replace the App component

Replace `src/App.tsx` with the provided App component code.

### 5. Update the TinyCore server URL

In `src/App.tsx`, update the `TINYCORE_CONFIG`:

```tsx
const TINYCORE_CONFIG = {
  baseUrl: 'http://localhost:3000' // Change this to your TinyCore server URL
};
```

### 6. Start the development server

```bash
npm run dev
```

## Usage

### First Time Setup

1. **Start your TinyCore-KV server** (usually on `http://localhost:3000`)

2. **Register the first user**: Since this is likely the first time running the app, you'll need to create an admin user. The app will show a registration form.

3. **Create the todo application**: After logging in, the app will prompt you to create the "todo-app" application in TinyCore. Click "Create Todo App".

4. **Start using the app**: Add your first todo and start managing your tasks!

### Key Features Demonstrated

- **Authentication Flow**: Login/register with email and password
- **Application Management**: Automatically creates the required application
- **Key-Value Operations**: 
  - Creating todos with `create(key, value)`
  - Listing todos with `useKVList()` 
  - Updating todos (toggle complete status)
  - Deleting todos with `deleteKey()`
- **Real-time Updates**: UI automatically updates when data changes
- **Error Handling**: Displays errors from the TinyCore client
- **Loading States**: Shows loading indicators during operations

## Code Structure

```
src/
├── App.tsx           # Main application component
├── index.css         # Tailwind CSS imports
└── main.tsx          # React app entry point
```

### Key Components

- **`LoginForm`**: Handles user authentication
- **`AppSetup`**: Ensures the todo application exists in TinyCore
- **`TodoApp`**: Main todo management interface
- **`TodoItem`**: Individual todo item component
- **`AppContent`**: Orchestrates the app flow based on auth state

## TinyCore Client Usage Examples

This example demonstrates several key patterns:

### 1. Provider Setup
```tsx
<TinyCoreProvider config={{ baseUrl: 'http://localhost:3000' }}>
  <App />
</TinyCoreProvider>
```

### 2. Authentication
```tsx
const { login, register, logout, user, isAuthenticated, loading } = useAuth();
```

### 3. Application Management
```tsx
const { applications, create } = useApplications();
```

### 4. Key-Value Operations
```tsx
const { data: todos, create, deleteKey, loading, error } = useKVList('todo-app', 'todo-');
```

### 5. Data Structure
Todos are stored with keys like `todo-1640995200000` and values like:
```json
{
  "text": "Learn TinyCore-KV",
  "completed": false,
  "createdAt": "2021-12-31T12:00:00.000Z"
}
```

## Customization Ideas

- Add due dates to todos
- Implement todo categories/tags
- Add todo priority levels
- Implement todo sharing between users
- Add todo search and filtering
- Implement todo reordering with drag & drop

## Troubleshooting

### Cannot connect to TinyCore server
- Ensure your TinyCore-KV server is running
- Check the `baseUrl` in `TINYCORE_CONFIG`
- Verify CORS is properly configured on your server

### Registration not working
- Make sure this is the first user being created
- Check the server logs for any errors

### Todos not persisting
- Verify the todo application was created successfully
- Check browser developer tools for network errors
- Ensure you're authenticated properly

## Learn More

- [TinyCore-KV Repository](https://github.com/jbatch/tinycore-kv)
- [TinyCore Client Documentation](https://github.com/jbatch/tinycore-kv/tree/main/packages/client)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)