#!/bin/bash
export TOKEN=$(curl -s http://localhost:3000/api/v1/users/login \
  -d '{"email": "josh_batch@live.com.au", "password": "Password1"}' \
  -H "Content-Type: application/json" | jq -r .token)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ Logged in successfully! Token set to \$TOKEN"
    echo "Token: $TOKEN"
else
    echo "❌ Login failed"
fi