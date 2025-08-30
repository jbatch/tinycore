# TinyCore

A lightweight backend-as-a-service platform designed for hobby projects and prototypes. TinyCore provides essential backend services in a single, self-contained deployment, allowing you to focus on building your frontend without the overhead of setting up authentication, databases, and APIs.

## Vision

Stop reinventing the wheel for every toy project. TinyCore gives you:
- **Authentication** out of the box
- **Key-value storage** for any data structure  
- **Multi-application support** to run multiple projects from one backend
- **Admin interface** for data management
- **TypeScript client** with React hooks for instant frontend integration

Perfect for hackathons, MVPs, personal projects, and learning experiments.

## Architecture

TinyCore is built as a monorepo with these packages:

### 📦 Packages

| Package | Description | Purpose |
|---------|-------------|---------|
| **[@tinycore/server](./packages/server)** | Express.js backend with SQLite | REST APIs, authentication, data storage |
| **[@tinycore/client](./packages/client)** | TypeScript client with React hooks | Frontend integration, API calls, state management |
| **[@tinycore/admin-ui](./packages/admin-ui)** | React admin interface | Data management, user-friendly CRUD operations |
| **[@tinycore/shared](./packages/shared)** | Common types and utilities | Shared code across packages |

## Quick Start

### Development

1. **Clone and install:**
   ```bash
   git clone https://github.com/jbatch/tinycore
   cd tinycore
   pnpm install
   ```

2. **Start the server:**
   ```bash
   pnpm run dev:server
   ```

3. **Start the admin UI (optional):**
   ```bash
   # In another terminal
   pnpm run dev:admin-ui
   ```

The server runs on `http://localhost:3000` and admin UI on `http://localhost:5173`.

### Production Deployment

```bash
# Build and run with Docker
pnpm run docker:build
pnpm run docker:run
```

Note: running docker container locally points to https://kv.jbat.ch (still need to fix this for local docker)

Access your deployment at `http://localhost:3000` with the admin UI built-in.


## Environment Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DB_PATH` | `./data/tinycore.db` | SQLite database path |
| `NODE_ENV` | `development` | Environment mode |
| `JWT_SECRET` | `your-secret-key-change-in-production` | JWT signing secret |
| `CORS_ORIGIN` | `*` | CORS allowed origins |

## Development

```bash
# Install dependencies
pnpm install

# Run all packages in development
pnpm run dev:all

# Build all packages
pnpm run build

# Run database migrations
pnpm run migrate status
pnpm run migrate up

# Clean build artifacts
pnpm run clean
```