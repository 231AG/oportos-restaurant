#!/usr/bin/env bash
# Rebuild and serve a production build on :3100 for visual verification.
#
# Next's dev server cannot be used for this in a sandboxed environment whose
# proxy blocks the Turbopack HMR websocket: hydration never completes and every
# entrance animation stays frozen at its initial state. A real production build
# behaves correctly, so all screenshotting and auditing runs against it.
set -e
cd "$(dirname "$0")/.."
npx next build
ps -eo pid,args | grep -F "next-server" | grep -v grep | awk '{print $1}' | xargs -r kill || true
sleep 1
nohup npx next start -p 3100 > /tmp/oportos-server.log 2>&1 &
for _ in $(seq 1 40); do
  sleep 1
  curl -s -o /dev/null http://127.0.0.1:3100/ && break
done
echo "OPORTOS running on http://127.0.0.1:3100"
