#!/bin/bash

echo "=== Testing Auth System ==="

# Test registration
echo ""
echo "1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@bhc.com","password":"TestPassword123"}')
echo "Register Response: $REGISTER_RESPONSE"

# Test login
echo ""
echo "2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@bhc.com","password":"TestPassword123"}')
echo "Login Response: $LOGIN_RESPONSE"

# Extract access token if login successful
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo ""
echo "Access Token: $ACCESS_TOKEN"

# Test protected endpoint
if [ -n "$ACCESS_TOKEN" ]; then
  echo ""
  echo "3. Testing Protected Endpoint..."
  PROTECTED=$(curl -s -X GET http://localhost:8080/auth/sessions?userId=test \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  echo "Protected Response: $PROTECTED"
fi

echo ""
echo "=== Done ==="
