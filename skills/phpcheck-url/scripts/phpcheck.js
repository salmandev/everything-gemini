#!/usr/bin/env node

/**
 * PHP2Shell Version Checker Script
 * Non-intrusive banner and version auditor for PHP2Shell (CVE-2026-109618 / CVE-2026-109619)
 * Based on OpenAI php2shell-checker (Apache-2.0)
 */

const { parseArgs } = require('node:util');

const VERSION = '1.0.0';
// Official PHP upstream releases fixing both CVE-2026-109618 and CVE-2026-109619 (published 2026-10-21)
const FIXED_IN = { '8.2': 35, '8.3': 36, '8.4': 27, '8.5': 12 };
const OLDER_BRANCHES = new Set(['5.4', '5.5', '5.6', '7.0', '7.1', '7.2', '7.3', '7.4', '8.0', '8.1']);
const USAGE = 'Usage: node phpcheck.js URL [--timeout SECONDS] [--json]\n' +
  '       node phpcheck.js --version\n' +
  '       node phpcheck.js --help';

function versionStatus(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)([-+~].*)?$/.exec(version || '');
  if (!match) return 'unknown';
  if (/(?:^|[-+~.])(?:dev|alpha|beta|rc)/i.test(match[4] || '')) return 'unknown';
  const branch = `${Number(match[1])}.${Number(match[2])}`;
  if (OLDER_BRANCHES.has(branch)) return 'potentially_vulnerable';
  const fixed = FIXED_IN[branch];
  if (fixed === undefined) return 'unknown';
  if (Number(match[3]) < fixed) return 'potentially_vulnerable';
  return 'ok';
}

async function urlHeaders(address, timeout) {
  if (/[\x00-\x20\x7f]/.test(address)) throw new Error('URL contains spaces or control characters');
  let targetUrl = address;
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }
  const url = new URL(targetUrl);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use an http:// or https:// URL');
  if (url.username || url.password || url.hash) throw new Error('URL credentials and fragments are not supported');

  const headers = [];
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'manual',
        signal: AbortSignal.timeout(Math.ceil(timeout * 1000)),
        headers: {
          'User-Agent': 'everything-gemini-phpcheck/1.0 (+https://github.com/salmandev/everything-gemini)'
        }
      });
      headers.push(response.headers.get('server') || '', response.headers.get('x-powered-by') || '');
      await response.body?.cancel();
      if (![405, 501].includes(response.status)) break;
    } catch (err) {
      if (method === 'HEAD') continue;
      throw err;
    }
  }
  return headers.join('\n');
}

async function runPhpCheck(argv = process.argv.slice(2)) {
  let values, address, timeout;
  try {
    const args = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        timeout: { type: 'string', default: '10' },
        json: { type: 'boolean' },
        version: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
    values = args.values;
    if (values.version) {
      console.log(VERSION);
      return 0;
    }
    if (values.help) {
      console.log(USAGE);
      return 0;
    }
    address = args.positionals[0];
    if (!address || args.positionals.length !== 1) {
      throw new Error('Provide exactly one URL or hostname');
    }
    timeout = Number(values.timeout);
    if (!(timeout > 0 && timeout <= 60)) {
      throw new Error('--timeout must be greater than 0 and at most 60 seconds');
    }
  } catch (error) {
    console.error(error.message + '\n' + USAGE);
    process.exitCode = 2;
    return 2;
  }

  let version = null;
  let error = null;
  let status = 'unknown';

  try {
    const text = await urlHeaders(address, timeout);
    for (const match of text.matchAll(/\bPHP[ /]([^\s,;)]+)/gi)) {
      const candidateStatus = versionStatus(match[1]);
      if (version === null || candidateStatus === 'potentially_vulnerable' || status === 'ok') {
        version = match[1];
        status = candidateStatus;
      }
      if (status === 'potentially_vulnerable') break;
    }
  } catch (exc) {
    error = exc.message;
  }

  let result = { patch_status: 'unknown', reason: error || 'PHP version not found in HTTP response headers (Server, X-Powered-By)' };
  if (version && !error) {
    result = {
      patch_status: status,
      reason: status === 'ok'
        ? `PHP ${version}: Advertised version meets an upstream fixed release (8.2.35, 8.3.36, 8.4.27, 8.5.12). Installed binary build not verified.`
        : `PHP ${version}: ${status === 'potentially_vulnerable' ? 'Potentially vulnerable. ' : ''}` +
          'HTTP headers cannot verify whether backported security patches exist. Check server package directly.',
    };
  }

  const code = { ok: 0, potentially_vulnerable: 1, unknown: 3 }[result.patch_status];
  const report = {
    cves: ['CVE-2026-109618', 'CVE-2026-109619'],
    target: address,
    patch_status: result.patch_status,
    php_version: version,
    reason: result.reason,
    fixed_upstream_releases: FIXED_IN,
    exit_code: code
  };

  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const statusLabel = result.patch_status.replace('_', ' ').toUpperCase();
    console.log(`${statusLabel}: ${result.reason}`);
    if (result.patch_status === 'potentially_vulnerable') {
      console.log('\nRemediation: Upgrade PHP to a patched vendor release or upstream (8.2.35+, 8.3.36+, 8.4.27+, 8.5.12+), and restart php-fpm or web server.');
    }
  }

  process.exitCode = code;
  return code;
}

if (require.main === module) {
  runPhpCheck().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(2);
  });
}

module.exports = { runPhpCheck, versionStatus, FIXED_IN, OLDER_BRANCHES };
