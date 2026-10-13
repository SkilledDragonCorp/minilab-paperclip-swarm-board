#!/usr/bin/env bash
# Clone pinned Paperclip upstream and run keyless Vitest (pnpm test → test:run).
set -euo pipefail

UPSTREAM_REPO="https://github.com/paperclipai/paperclip.git"
# Pin: git ls-remote https://github.com/paperclipai/paperclip.git HEAD (at minilab ship)
UPSTREAM_SHA="f329b24ee12496e710ad17377ec7716e0eee22ef"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="${UPSTREAM_WORKDIR:-$(mktemp -d -t paperclip-upstream-XXXXXX)}"
CLEANUP="${UPSTREAM_KEEP:-0}"

cleanup() {
  if [[ "$CLEANUP" != "1" ]]; then
    rm -rf "$WORK"
  else
    echo "UPSTREAM_KEEP=1 — left clone at: $WORK"
  fi
}
trap cleanup EXIT

echo "==> Cloning Paperclip @ ${UPSTREAM_SHA}"
git init "$WORK"
git -C "$WORK" remote add origin "$UPSTREAM_REPO"
git -C "$WORK" fetch --depth 1 origin "$UPSTREAM_SHA"
git -C "$WORK" checkout FETCH_HEAD

echo "==> Node $(node -v) (upstream requires >=24.11.0)"
node -e "const v=process.versions.node.split('.').map(Number); const ok=v[0]>24||(v[0]===24&&v[1]>=11); if(!ok) { console.error('Node >=24.11.0 required'); process.exit(1); }"

echo "==> corepack enable && pnpm install --frozen-lockfile"
cd "$WORK"
corepack enable
pnpm install --frozen-lockfile

echo "==> pnpm test (Vitest via test:run — not Playwright e2e default)"
pnpm test

echo "==> PASS: upstream Vitest suite exited 0"
