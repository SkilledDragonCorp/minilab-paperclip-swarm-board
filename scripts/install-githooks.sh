#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
git -C "$ROOT" config core.hooksPath .githooks
chmod +x "$ROOT/.githooks/pre-commit" "$ROOT/scripts/gitleaks-detect.sh" 2>/dev/null || true
echo "Installed gitleaks pre-commit hook via core.hooksPath=.githooks"
