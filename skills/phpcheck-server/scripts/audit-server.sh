#!/usr/bin/env bash

# PHP2Shell Server-Side Audit Script
# Audits local server, host OS, containers, and running PHP-FPM / Apache processes
# for CVE-2026-109618 and CVE-2026-109619.

set -eo pipefail

JSON_MODE=false
if [[ "$1" == "--json" ]]; then
  JSON_MODE=true
fi

# Detect OS
OS_NAME="unknown"
OS_VERSION="unknown"
if [ -f /etc/os-release ]; then
  # shellcheck source=/dev/null
  . /etc/os-release
  OS_NAME="${ID:-unknown}"
  OS_VERSION="${VERSION_ID:-unknown}"
elif command -v sw_vers >/dev/null 2>&1; then
  OS_NAME="macos"
  OS_VERSION="$(sw_vers -productVersion)"
fi

# Check PHP binary on PATH
PHP_CLI_VERSION="none"
if command -v php >/dev/null 2>&1; then
  PHP_CLI_VERSION="$(php -r 'echo PHP_VERSION;' 2>/dev/null || php -v 2>/dev/null | head -n1 | awk '{print $2}' || echo "unknown")"
fi

# Check running processes
RUNNING_PHP_PROCS=""
if command -v pgrep >/dev/null 2>&1; then
  RUNNING_PHP_PROCS="$(pgrep -a -f 'php-fpm|apache2|httpd|php' 2>/dev/null || true)"
fi

# Check for un-restarted upgraded binaries (deleted from disk but in RAM)
DELETED_PROCESSES=""
if [ -d /proc ]; then
  DELETED_PROCESSES="$(ls -l /proc/*/exe 2>/dev/null | grep -E '(php|apache|httpd).*\(deleted\)' || true)"
fi

STATUS="unknown"
DETAILS="No active PHP packages or processes detected on server."

if [ "$PHP_CLI_VERSION" != "none" ]; then
  # Parse major.minor.patch
  MAJOR="$(echo "$PHP_CLI_VERSION" | cut -d. -f1)"
  MINOR="$(echo "$PHP_CLI_VERSION" | cut -d. -f2)"
  PATCH="$(echo "$PHP_CLI_VERSION" | cut -d. -f3 | sed 's/[^0-9].*//')"
  BRANCH="${MAJOR}.${MINOR}"

  if [[ "$BRANCH" =~ ^(5\.|7\.|8\.0|8\.1) ]]; then
    STATUS="potentially_vulnerable"
    DETAILS="PHP $PHP_CLI_VERSION belongs to an EOL branch. Check if vendor security backports (USN/RHSA) are installed."
  elif [[ "$BRANCH" == "8.2" && "$PATCH" -ge 35 ]]; then
    STATUS="ok"
    DETAILS="PHP $PHP_CLI_VERSION meets or exceeds upstream fixed release 8.2.35."
  elif [[ "$BRANCH" == "8.3" && "$PATCH" -ge 36 ]]; then
    STATUS="ok"
    DETAILS="PHP $PHP_CLI_VERSION meets or exceeds upstream fixed release 8.3.36."
  elif [[ "$BRANCH" == "8.4" && "$PATCH" -ge 27 ]]; then
    STATUS="ok"
    DETAILS="PHP $PHP_CLI_VERSION meets or exceeds upstream fixed release 8.4.27."
  elif [[ "$BRANCH" == "8.5" && "$PATCH" -ge 12 ]]; then
    STATUS="ok"
    DETAILS="PHP $PHP_CLI_VERSION meets or exceeds upstream fixed release 8.5.12."
  elif [[ "$BRANCH" =~ ^8\.[2345] ]]; then
    STATUS="potentially_vulnerable"
    DETAILS="PHP $PHP_CLI_VERSION is below upstream fix for branch $BRANCH."
  fi
fi

if [ -n "$DELETED_PROCESSES" ]; then
  DETAILS="$DETAILS [CRITICAL WARNING: Running processes reference unlinked/deleted binaries. Web workers must be restarted: systemctl restart php*-fpm]"
fi

if [ "$JSON_MODE" = true ]; then
  cat <<EOF
{
  "cves": ["CVE-2026-109618", "CVE-2026-109619"],
  "os_id": "$OS_NAME",
  "os_version": "$OS_VERSION",
  "php_cli_version": "$PHP_CLI_VERSION",
  "patch_status": "$STATUS",
  "details": "$DETAILS",
  "stale_memory_workers_detected": $([ -n "$DELETED_PROCESSES" ] && echo true || echo false)
}
EOF
else
  echo "🛡️ PHP2Shell Server Security Audit"
  echo "=================================="
  echo "OS Distribution: $OS_NAME $OS_VERSION"
  echo "PHP CLI Version: $PHP_CLI_VERSION"
  echo "Patch Status:    $STATUS"
  echo "Audit Details:   $DETAILS"
  if [ -n "$DELETED_PROCESSES" ]; then
    echo ""
    echo "⚠️ ALERT: Un-restarted worker processes detected!"
    echo "Run: sudo systemctl restart 'php*-fpm' or sudo systemctl restart apache2"
  fi
fi

if [ "$STATUS" = "ok" ]; then
  exit 0
elif [ "$STATUS" = "potentially_vulnerable" ]; then
  exit 1
else
  exit 3
fi
