#!/bin/bash
# 작업 실행기 켜기 — Finder에서 더블클릭. 켜져 있는 동안 Claude가 허용된 작업(scripts/runner/tasks.mjs)을 실행할 수 있습니다.
cd "$(dirname "$0")/.." || exit 1
printf '\033]0;OnBoarding 작업 실행기\007'
exec node scripts/runner/runner.mjs
