#!/bin/bash

# Determine the base URL and password handling
if [[ "$1" == "prod" || "$1" == "production" ]]; then
    BASE_URL="https://kv.jbat.ch"
    echo "🌐 Using production URL: $BASE_URL"
    echo -n "Enter password: "
    read -s PASSWORD
    echo  # Add newline after hidden input
else
    BASE_URL="http://localhost:3000"
    PASSWORD="Password1"
    echo "🏠 Using local URL: $BASE_URL"
fi

export TOKEN=$(curl -s "$BASE_URL/api/v1/users/login" \
  -d "{\"email\": \"josh_batch@live.com.au\", \"password\": \"$PASSWORD\"}" \
  -H "Content-Type: application/json" | jq -r .token)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ Logged in successfully! Token set to \$TOKEN"
    echo "Token: $TOKEN"
else
    echo "❌ Login failed"
fi