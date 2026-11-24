#!/bin/bash
# 1단계 설치·검증 스크립트 (Finder에서 더블클릭하면 터미널에서 실행됩니다)
# 하는 일: npm install → .env 준비 → 타입 검사 → 린트 → 테스트 → 서버·웹 실행 확인 → 브라우저 열기
# 기록: logs/step1-setup.log
cd "$(dirname "$0")/.." || exit 1
mkdir -p logs
LOG="logs/step1-setup.log"
exec > >(tee "$LOG") 2>&1

step() { echo; echo "==================== $1 ===================="; }
fail() { echo; echo "❌ 실패: $1"; echo "RESULT=FAIL($1)"; exit 1; }

step "0. 환경"
echo "폴더: $(pwd)"
command -v node >/dev/null || fail "Node.js가 설치되어 있지 않습니다 (https://nodejs.org 에서 22 LTS 설치)"
echo "node $(node -v), npm $(npm -v)"
MAJOR=$(node -p "process.versions.node.split('.')[0]")
[ "$MAJOR" -ge 22 ] || fail "Node 22.12 이상이 필요합니다 (현재 $(node -v))"

step "1. npm install"
npm install || fail "npm install"

step "2. .env 준비"
if [ -f .env ]; then echo ".env 이미 있음 (그대로 사용)"; else cp .env.example .env && echo ".env 생성 (Mock 모드)"; fi

step "3. 타입 검사"
npm run typecheck || fail "typecheck"

step "4. 린트"
npm run lint || fail "lint"

step "5. 테스트"
npm test || fail "test"

step "6. 서버·웹 실행 확인"
npm run dev > logs/dev.log 2>&1 &
DEV_PID=$!
OK=""
for i in $(seq 1 40); do
  H=$(curl -s http://localhost:5173/api/health) && echo "$H" | grep -q '"ok":true' && OK=1 && break
  sleep 1
done
[ -n "$OK" ] || { echo "--- dev.log ---"; tail -40 logs/dev.log; kill $DEV_PID 2>/dev/null; fail "서버/웹 실행 확인"; }
echo "웹(5173) → 서버 프록시 /api/health 응답: $H"

step "7. Git 초기화"
if [ -d .git ]; then echo "이미 Git 저장소입니다 (건너뜀)"
elif ! command -v git >/dev/null; then echo "git이 없어 건너뜀"
else
  git init -q -b main && git add -A
  if git config user.name >/dev/null && git config user.email >/dev/null; then
    git commit -q -m "[단계1] 프로젝트 골격" && echo "첫 커밋 완료: $(git log --oneline -1)"
  else
    echo "git 사용자 정보가 없어 커밋은 건너뜀 (git config --global user.name / user.email 설정 후 직접 커밋)"
  fi
fi

echo
echo "✅ 1단계 확인 완료 — 브라우저에서 http://localhost:5173 을 엽니다."
echo "RESULT=OK"
open http://localhost:5173
echo "(이 창을 닫으면 개발 서버도 종료됩니다)"
wait $DEV_PID
