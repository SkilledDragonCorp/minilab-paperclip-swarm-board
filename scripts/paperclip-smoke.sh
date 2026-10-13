#!/usr/bin/env bash
# Keyless smoke: print paperclipai CLI help/onboard docs (no API keys, no onboard --yes).
set -euo pipefail

export npm_config_update_notifier=false

echo "==> npx paperclipai@latest --help"
npx paperclipai@latest --help

echo ""
echo "==> npx paperclipai@latest onboard --help"
npx paperclipai@latest onboard --help

echo ""
echo "==> PASS: CLI help smoke (dry docs only)"
