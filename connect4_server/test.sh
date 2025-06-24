#!/usr/bin/env bash
# test.sh — smoke tests

BASE=http://localhost:8000

echo "1) Preflight OPTIONS"
curl -i \
  -X OPTIONS \
  -H "Origin: https://papergames.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  $BASE/board \
| grep -E "HTTP/|Access-Control-Allow-Origin|Access-Control-Allow-Methods|Access-Control-Allow-Headers"

echo -e "\n2) POST valid board"
curl -i -X POST $BASE/board \
  -H "Content-Type: application/json" \
  -d '{"board":[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,1,2,0,0,0],[0,0,2,1,0,0,0]]}'

echo -e "\n3) GET /show"
curl -s $BASE/show

echo -e "\n4) POST bad payload"
curl -i -X POST $BASE/board \
  -H "Content-Type: application/json" \
  -d '{}'

