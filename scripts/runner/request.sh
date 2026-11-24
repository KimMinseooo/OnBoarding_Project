#!/bin/bash
# Claude가 실행기에 작업을 요청할 때 쓰는 도우미.
# 사용: scripts/runner/request.sh <작업> ['<JSON 인자>'] [대기초=170]
cd "$(dirname "$0")/../.." || exit 1
TASK="$1"; ARGS="${2:-null}"; WAIT="${3:-170}"
HB=.runner/heartbeat
if [ ! -f "$HB" ] || [ $(( $(date +%s) - $(stat -c %Y "$HB" 2>/dev/null || stat -f %m "$HB") )) -gt 5 ]; then
  echo "RUNNER_OFFLINE: 맥에서 scripts/runner.command 를 더블클릭해 실행기를 켜 주세요."; exit 3
fi
ID="$(date +%Y%m%d-%H%M%S)-$TASK-$RANDOM"
mkdir -p .runner/inbox
printf '{"id":"%s","task":"%s","args":%s}' "$ID" "$TASK" "$ARGS" > ".runner/inbox/$ID.tmp" && mv ".runner/inbox/$ID.tmp" ".runner/inbox/$ID.json"
for _ in $(seq 1 "$WAIT"); do
  [ -f ".runner/out/$ID.done" ] && { cat ".runner/out/$ID.log"; echo "DONE $(cat .runner/out/$ID.done)"; exit 0; }
  sleep 1
done
echo "STILL_RUNNING id=$ID (나중에 .runner/out/$ID.log 확인)"; [ -f ".runner/out/$ID.log" ] && tail -30 ".runner/out/$ID.log"; exit 4
