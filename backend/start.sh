#!/bin/bash
cd "$(dirname "$0")"

npm run dev &
BACKEND_PID=$!

trap "kill $BACKEND_PID" EXIT

sleep 3

cloudflared tunnel --url http://localhost:3000
