# TinyCore-KV Admin UI

A React-based administration interface for managing TinyCore-KV applications and exploring their key-value stores.

## Overview

TinyCore-KV Admin UI provides a user-friendly interface for managing applications and their associated key-value stores in TinyCore-KV. It enables administrators to:

- Create, view, and delete applications
- Browse and search key-value pairs within each application
- Add and remove key-value entries
- Manage application and key-value metadata

## Features

- **Application Management**
  - List all applications with their creation timestamps
  - Create new applications with custom IDs and metadata
  - Delete applications and their associated data
- **Key-Value Store Management**
  - Browse all key-value pairs for each application
  - Search keys by prefix
  - Add new key-value pairs with optional metadata
  - Delete existing key-value pairs
  - View formatted JSON values and metadata
- **User Interface**
  - Clean, modern interface built with React and shadcn/ui
  - Tabbed navigation between applications and KV store views
  - Pagination for large datasets
  - JSON validation for value and metadata fields

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- A running instance of TinyCore-KV server

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:jbatch/tinycore-kv.git
   cd kv-admin
   ```

2. Install dependencies:

   ```bash
   yarn
   ```

3. [OPTIONAL] Configure environment variables:
   Create a `.env` file with:

   ```
   VITE_API_BASE_URL=/api/v1  # Adjust if your API is hosted elsewhere
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

## TODO

- [ ] Admin authentication and authorization
- [ ] Validation of object fields
- [ ] Enhanced metadata visualization
- [ ] Batch operations for key-value pairs
