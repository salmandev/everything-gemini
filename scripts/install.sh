#!/usr/bin/env bash
set -eo pipefail

# Everything Gemini (everything-gemini) Installer
# Fast setup script for macOS and Linux

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "  🪐 Everything Gemini (everything-gemini) Installer"
echo "  The premier agent harness & customization suite for Google Antigravity"
echo -e "${RESET}"

PROFILE="developer"
INSTALL_GLOBAL=false
TARGET_DIR=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --profile) PROFILE="$2"; shift ;;
    --global) INSTALL_GLOBAL=true ;;
    --workspace) TARGET_DIR="$2"; shift ;;
    *) echo "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

# If run directly via curl pipe, clone into temporary directory or clone repo
if [ ! -f "bin/everything-gemini" ]; then
  echo -e "${YELLOW}Downloading latest everything-gemini release...${RESET}"
  TMP_DIR=$(mktemp -d)
  git clone --depth 1 https://github.com/salmandev/everything-gemini.git "$TMP_DIR/everything-gemini" 2>/dev/null || {
    echo "Failed to clone repository. Please ensure git is installed."
    exit 1
  }
  cd "$TMP_DIR/everything-gemini"
fi

# Run node installer
CLI_ARGS="install --profile $PROFILE"
if [ "$INSTALL_GLOBAL" = true ]; then
  CLI_ARGS="$CLI_ARGS --global"
fi
if [ -n "$TARGET_DIR" ]; then
  CLI_ARGS="$CLI_ARGS --workspace $TARGET_DIR"
fi

./bin/everything-gemini $CLI_ARGS
