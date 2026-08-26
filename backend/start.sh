#!/bin/bash
cd "$(dirname "$0")"

npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &
TUNNEL_PID=$!

trap "kill $BACKEND_PID $TUNNEL_PID" EXIT

echo "Subindo backend e tunel..."

URL=""
for i in $(seq 1 30); do
    URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' tunnel.log | head -1)
    if [ -n "$URL" ]; then
        break
    fi
    sleep 1
done

echo ""
if [ -n "$URL" ]; then
    echo "Link do site: $URL"
else
    echo "Nao consegui gerar o link ainda. Veja tunnel.log para detalhes."
fi
echo ""
echo "(deixe esta janela aberta; Ctrl+C encerra tudo)"

wait
