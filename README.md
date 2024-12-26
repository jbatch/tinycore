# TinyCore-KV

A lightweight key-value store service designed for hobby projects. TinyCore-KV provides a simple, self-contained storage solution with a built-in admin interface for easy data management.

## Features

- **Simple Key-Value Storage**
  - REST API for storing and retrieving JSON data
  - Key prefix searching
  - Support for metadata on both applications and key-value pairs
- **Multi-Application Support**
  - Create separate applications to isolate different data sets
  - Each application gets its own key-value namespace
- **Built-in Admin Interface**
  - Web-based UI for managing applications
  - Browse and search stored data
  - Add/remove key-value pairs through the interface
- **Lightweight & Self-Contained**
  - Uses SQLite for zero-configuration storage
  - Single binary deployment
  - Minimal resource requirements

## Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/jbatch/tinycore-kv
   cd tinycore-kv
   ```

2. Install dependencies:

   ```bash
   yarn
   ```

3. Build the admin UI and server:
   ```bash
   yarn dev
   ```

## Docker Deployment

Build the Docker image:

```bash
docker build -t tinycore-kv .
```

Run with persistent storage:

```bash
docker run -p 3000:3000 --mount type=volume,src=kv-data,dst=/app/data -d tinycore-kv
```

Environment variables:

- `PORT`: Server port (default: 3000)
- `DB_PATH`: SQLite database path (default: ./data/tinycore.db)
- `NODE_ENV`: Environment mode (development/production)

## API Usage

### Applications

```bash
# Create an application
curl -X POST http://localhost:3000/api/v1/apps \
  -H "Content-Type: application/json" \
  -d '{"id": "my-app", "name": "My App", "metadata": {"env": "dev"}}'

# List applications
curl http://localhost:3000/api/v1/apps

# Delete an application
curl -X DELETE http://localhost:3000/api/v1/apps/my-app
```

### Key-Value Operations

```bash
# Set a value
curl -X PUT http://localhost:3000/api/v1/kv/my-app/my-key \
  -H "Content-Type: application/json" \
  -d '{"value": {"hello": "world"}, "metadata": {"type": "greeting"}}'

# Get a value
curl http://localhost:3000/api/v1/kv/my-app/my-key

# List all keys (with optional prefix)
curl http://localhost:3000/api/v1/kv/my-app?prefix=my-

# Delete a value
curl -X DELETE http://localhost:3000/api/v1/kv/my-app/my-key
```

## TODO

- [ ] Add authentication for admin interface
- [ ] Add rate limiting and storage quotas
- [ ] Support for data export/import
- [ ] Advanced querying capabilities
