# @jbatch/tinycore-client

TypeScript client library with React hooks for seamless TinyCore integration. Get authentication, data storage, and application management in your React apps with just a few lines of code.

## Installation

```bash
npm install @jbatch/tinycore-client
# or
yarn add @jbatch/tinycore-client
# or  
pnpm add @jbatch/tinycore-client
```

Note: Tinycore client is not yet published tp npm

## Quick Start

### 1. Set up the provider

Wrap your app with the TinyCore provider:

```tsx
import { TinyCoreProvider } from '@jbatch/tinycore-client';

function App() {
  return (
    <TinyCoreProvider config={{ baseUrl: 'http://localhost:3000' }}>
      <MyApp />
    </TinyCoreProvider>
  );
}
```

### 2. Use authentication

```tsx
import { useAuth } from '@jbatch/tinycore-client';

function AuthComponent() {
  const { login, register, logout, user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user.email}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => login('user@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => register('new@example.com', 'password')}>
        Register
      </button>
    </div>
  );
}
```

### 3. Store and retrieve data

```tsx
import { useKVStore, useKVList } from '@jbatch/tinycore-client';

function DataComponent() {
  // Single key-value operations
  const { data, set, delete: deleteKey, loading } = useKVStore('my-app', 'user-settings');
  
  // List operations
  const { data: allItems, create, deleteKey: deleteItem } = useKVList('my-app', 'todos-');

  const updateSettings = () => {
    set({ theme: 'dark', language: 'en' });
  };

  const addTodo = () => {
    create('todos-' + Date.now(), { text: 'New todo', completed: false });
  };

  return (
    <div>
      <button onClick={updateSettings}>Update Settings</button>
      <button onClick={addTodo}>Add Todo</button>
      
      {allItems?.map(item => (
        <div key={item.key}>
          {JSON.stringify(item.value)}
          <button onClick={() => deleteItem(item.key)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Manage applications

```tsx
import { useApplications } from '@jbatch/tinycore-client';

function AppsComponent() {
  const { applications, create, delete: deleteApp } = useApplications();

  const createApp = () => {
    create({
      id: 'my-new-app',
      name: 'My New App',
      metadata: { version: '1.0.0' }
    });
  };

  return (
    <div>
      <button onClick={createApp}>Create App</button>
      
      {applications?.map(app => (
        <div key={app.id}>
          <h3>{app.name}</h3>
          <button onClick={() => deleteApp(app.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Available Hooks

### Authentication
- `useAuth()` - Login, logout, registration, current user state
- `useRegistrationStatus()` - Check if registration is allowed

### Key-Value Storage  
- `useKVStore(appId, key)` - Single key operations (get, set, delete)
- `useKVList(appId, prefix?)` - List operations with optional prefix filtering

### Application Management
- `useApplications()` - List, create, update, delete applications
- `useApplication(id)` - Single application operations

## API Classes

If you prefer direct API calls without React hooks:

```tsx
import { TinyCoreApiClient, AuthApi, KVApi, ApplicationsApi } from '@jbatch/tinycore-client';

const client = new TinyCoreApiClient({ baseUrl: 'http://localhost:3000' });
const auth = new AuthApi(client);
const kv = new KVApi(client);
const apps = new ApplicationsApi(client);

// Direct API usage
const { user, token } = await auth.login('user@example.com', 'password');
client.setToken(token);

await kv.set('my-app', 'my-key', { hello: 'world' });
const item = await kv.get('my-app', 'my-key');
```

## Configuration

The `TinyCoreProvider` accepts these config options:

```tsx
<TinyCoreProvider config={{
  baseUrl: 'http://localhost:3000',  // Required: TinyCore server URL
  apiVersion: 'v1'                   // Optional: API version (default: 'v1')
}}>
```

## TypeScript Support

All hooks and API methods are fully typed. The client exports all necessary types:

```tsx
import type { 
  User, 
  Application, 
  KVItem, 
  LoginResponse,
  TinyCoreConfig 
} from '@jbatch/tinycore-client';
```

## Error Handling

All hooks include error states and loading indicators:

```tsx
const { data, error, loading, refetch } = useKVStore('my-app', 'my-key');

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;

return <div>{JSON.stringify(data)}</div>;
```

## Examples

TODO: Provide examples

Check out example implementations:
- [Todo App](./examples/todo-app)
- [User Profile Manager](./examples/profile-manager)
- [Multi-App Dashboard](./examples/dashboard)
