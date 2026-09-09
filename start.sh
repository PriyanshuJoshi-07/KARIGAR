#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if ! pg_isready -q 2>/dev/null; then
  pg_ctlcluster 15 main start || true
fi

npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

npm run dev:server &
SERVER_PID=$!
npm run dev:client &
CLIENT_PID=$!

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null || true" EXIT
wait
