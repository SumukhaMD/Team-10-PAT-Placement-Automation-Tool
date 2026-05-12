#!/bin/bash

echo "========================================"
echo "PlaceIT API Testing Script"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

GATEWAY_URL="http://localhost:8080"
AUTH_DIRECT_URL="http://localhost:8081"

echo ""
echo -e "${YELLOW}Step 1: Check if services are running${NC}"
echo "----------------------------------------"

# Check Eureka
echo -n "Eureka Server (8761): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8761/actuator/health | grep -q "200"; then
    echo -e "${GREEN}UP${NC}"
else
    echo -e "${RED}DOWN${NC}"
fi

# Check API Gateway
echo -n "API Gateway (8080): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}UP${NC}"
else
    echo -e "${RED}DOWN or no actuator${NC}"
fi

# Check Auth Service directly
echo -n "Auth Service Direct (8081): "
AUTH_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/health 2>/dev/null)
if [ "$AUTH_HEALTH" = "200" ]; then
    echo -e "${GREEN}UP${NC}"
else
    echo -e "${RED}DOWN (HTTP $AUTH_HEALTH)${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Test Auth Service Directly (bypassing gateway)${NC}"
echo "------------------------------------------------------"

echo "Testing: GET http://localhost:8081/health"
curl -s http://localhost:8081/health | jq . 2>/dev/null || curl -s http://localhost:8081/health
echo ""

echo "Testing: GET http://localhost:8081/auth/health"
curl -s http://localhost:8081/auth/health | jq . 2>/dev/null || curl -s http://localhost:8081/auth/health
echo ""

echo ""
echo -e "${YELLOW}Step 3: Test Registration through Gateway${NC}"
echo "------------------------------------------"

echo "Testing: POST http://localhost:8080/api/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "STUDENT"
  }' -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$REGISTER_RESPONSE" | sed 's/HTTP_CODE:.*//')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

echo ""
echo -e "${YELLOW}Step 4: Test Registration Directly (bypassing gateway)${NC}"
echo "------------------------------------------------------"

echo "Testing: POST http://localhost:8081/auth/register"
DIRECT_RESPONSE=$(curl -s -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Direct Test User",
    "email": "direct@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "STUDENT"
  }' -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$DIRECT_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$DIRECT_RESPONSE" | sed 's/HTTP_CODE:.*//')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

echo ""
echo -e "${YELLOW}Step 5: Check Eureka registered services${NC}"
echo "-----------------------------------------"
echo "Registered applications:"
curl -s http://localhost:8761/eureka/apps | grep -oP '(?<=<application>).*?(?=</application>)' | head -10 || echo "Could not fetch Eureka apps"

echo ""
echo "========================================"
echo "Testing Complete"
echo "========================================"
