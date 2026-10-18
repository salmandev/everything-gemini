/**
 * Everything Gemini CLI End-to-End Integration Test Suite
 * Validates CLI subcommands, dry-run simulation, and JSON output formatting.
 */

const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '..');
const CLI_PATH = path.join(REPO_ROOT, 'bin', 'everything-gemini');

function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

function runCli(args, env = {}) {
  const cmd = `node "${CLI_PATH}" ${args}`;
  try {
    const rawStdout = execSync(cmd, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: { ...process.env, ...env }
    });
    return { status: 0, stdout: stripAnsi(rawStdout), rawStdout, stderr: '' };
  } catch (err) {
    return {
      status: err.status || 1,
      stdout: err.stdout ? stripAnsi(err.stdout.toString()) : '',
      rawStdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : err.message
    };
  }
}

console.log('🧪 Starting Everything Gemini CLI E2E Tests...\n');

let testsPassed = 0;
let testsFailed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✔ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✖ ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

// 1. Doctor
it('should run doctor successfully', () => {
  const res = runCli('doctor');
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /Running Antigravity & Environment Diagnostics/);
  assert.match(res.stdout, /Node\.js runtime/);
});

// 2. List
it('should list all components across catalog', () => {
  const res = runCli('list');
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /Everything Gemini Catalog/);
  assert.match(res.stdout, /gemini-multimodal/);
  assert.match(res.stdout, /code-reviewer/);
  assert.match(res.stdout, /safety-shield/);
});

// 3. Info / Show
it('should display info for a progressive skill', () => {
  const res = runCli('info agent-evals');
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /Skill Overview: agent-evals/);
  assert.match(res.stdout, /Trigger Description/);
});

it('should display info for a scoped subagent', () => {
  const res = runCli('info planner');
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /Subagent Specification: planner/);
  assert.match(res.stdout, /Scoped Subagent: Strategic Planner/);
});

// 4. Benchmark & Test-All with JSON
it('should benchmark ecosystem components and output valid JSON with --json', () => {
  const res = runCli('benchmark --json');
  assert.strictEqual(res.status, 0);
  const data = JSON.parse(res.stdout);
  assert.strictEqual(data.totalComponents, 60);
  assert.strictEqual(data.progressiveSkillsCount, 44);
  assert.strictEqual(data.scopedAgentsCount, 9);
  assert.strictEqual(data.lifecycleHooksCount, 7);
  assert(data.totalRunbookTokens > 15000, 'Expected >15,000 runbook tokens');
  assert(data.estimatedTokensSavedPerTurn > 8000, 'Expected significant token savings');
});

// 5. Completion
it('should generate shell autocompletion script', () => {
  const res = runCli('completion');
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /_everything_gemini\(\)/);
  assert.match(res.stdout, /complete -F _everything_gemini/);
});

it('should support completion --install --dry-run', () => {
  const res = runCli('completion --install --dry-run');
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout, /DRY RUN/);
  assert.match(res.stdout, /Would append completion script/);
});

// 6. Sandboxed Workspace Tests
const tempWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'egemini-test-'));

try {
  it('should install completion script idempotently to a custom rc file', () => {
    const customRc = path.join(tempWorkspace, 'test.bashrc');
    fs.writeFileSync(customRc, '# existing rc\n');
    const res1 = runCli(`completion --install --rc "${customRc}"`);
    assert.strictEqual(res1.status, 0);
    assert.match(res1.stdout, /Successfully installed autocompletion/);
    assert(fs.readFileSync(customRc, 'utf8').includes('_everything_gemini()'));

    // Test idempotency
    const res2 = runCli(`completion --install --rc "${customRc}"`);
    assert.strictEqual(res2.status, 0);
    assert.match(res2.stdout, /already configured/);
  });
  // Dry run installation
  it('should support --dry-run on install without creating directories', () => {
    const dryWorkspace = path.join(tempWorkspace, 'dry-run-workspace');
    const res = runCli(`install --workspace "${dryWorkspace}" --profile developer --dry-run`);
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /DRY RUN MODE ACTIVATED/);
    assert.match(res.stdout, /Would install/);
    assert.strictEqual(fs.existsSync(dryWorkspace), false, 'Dry run should not create target workspace');
  });

  // Real installation
  it('should install developer profile into custom workspace', () => {
    const res = runCli(`install --workspace "${tempWorkspace}" --profile developer`);
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /Installation complete/);
    assert.strictEqual(fs.existsSync(path.join(tempWorkspace, 'GEMINI.md')), true);
    assert.strictEqual(fs.existsSync(path.join(tempWorkspace, 'AGENTS.md')), true);
    assert.strictEqual(fs.existsSync(path.join(tempWorkspace, 'skills', 'tdd-workflow', 'SKILL.md')), true);
    assert.strictEqual(fs.existsSync(path.join(tempWorkspace, 'hooks.json')), true);
  });

  // Status check (Human & JSON)
  it('should report workspace status in human format', () => {
    const res = runCli(`status --workspace "${tempWorkspace}"`);
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /Everything Gemini Workspace Status/);
    assert.match(res.stdout, /GEMINI\.md \(active\)/);
    assert.match(res.stdout, /Installed Skills/);
  });

  it('should report workspace status in structured JSON format with --json', () => {
    const res = runCli(`status --workspace "${tempWorkspace}" --json`);
    assert.strictEqual(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert.strictEqual(data.isInitialized, true);
    assert.strictEqual(data.rules.gemini, true);
    assert.strictEqual(data.rules.agents, true);
    assert(data.skills.installedCount >= 10, 'Expected at least 10 skills in developer profile');
  });

  // Add & Remove component
  it('should dynamically add and remove a skill to active workspace', () => {
    const addRes = runCli(`add skill stripe-integration --workspace "${tempWorkspace}"`);
    assert.strictEqual(addRes.status, 0);
    assert.strictEqual(fs.existsSync(path.join(tempWorkspace, 'skills', 'stripe-integration', 'SKILL.md')), true);

    const removeRes = runCli(`remove skill stripe-integration --workspace "${tempWorkspace}"`);
    assert.strictEqual(removeRes.status, 0);
    assert.strictEqual(fs.existsSync(path.join(tempWorkspace, 'skills', 'stripe-integration')), false);
  });

  // Update in dry-run and live
  it('should support --dry-run on update without modifications', () => {
    const res = runCli(`update --workspace "${tempWorkspace}" --dry-run`);
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /DRY RUN MODE ACTIVATED/);
    assert.match(res.stdout, /Would update skill/);
  });

  it('should update installed workspace components cleanly', () => {
    const res = runCli(`update --workspace "${tempWorkspace}"`);
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /Update complete/);
  });

  // Diff Command
  it('should run diff against workspace', () => {
    const res = runCli(`diff --workspace "${tempWorkspace}"`);
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /Comparing Workspace vs\. Master Everything Gemini Catalog/);
    assert.match(res.stdout, /Progressive Skills Comparison/);
  });

  // Export Command
  it('should export workspace configuration bundle to JSON', () => {
    const exportFile = path.join(tempWorkspace, 'exported-profile.json');
    const res = runCli(`export --workspace "${tempWorkspace}" --output "${exportFile}"`);
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /Exporting Agent Configuration Bundle/);
    assert.strictEqual(fs.existsSync(exportFile), true, 'Export file should exist');
    const data = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
    assert.strictEqual(data.generator, 'everything-gemini');
    assert(data.skills.length > 0, 'Exported bundle should contain skills');
  });

  // Info for newly added subagents and skills
  it('should display info for database-migrator subagent and clickhouse-analytics skill', () => {
    const res1 = runCli('info database-migrator');
    assert.strictEqual(res1.status, 0);
    assert.match(res1.stdout, /Database Migrator/);

    const res2 = runCli('info clickhouse-analytics');
    assert.strictEqual(res2.status, 0);
    assert.match(res2.stdout, /ClickHouse Analytics/);

    const res3 = runCli('info duckdb-local-olap');
    assert.strictEqual(res3.status, 0);
    assert.match(res3.stdout, /DuckDB Local OLAP/);
  });

  // Import Command
  it('should import agent configuration bundle cleanly', () => {
    const exportFile = path.join(tempWorkspace, 'exported-profile.json');
    const importWorkspace = path.join(tempWorkspace, 'imported-workspace');

    // Dry run
    const dryRes = runCli(`import "${exportFile}" --workspace "${importWorkspace}" --dry-run`);
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /DRY RUN MODE ACTIVATED/);
    assert.match(dryRes.stdout, /Would import/);

    // Live import
    const liveRes = runCli(`import "${exportFile}" --workspace "${importWorkspace}"`);
    assert.strictEqual(liveRes.status, 0);
    assert.match(liveRes.stdout, /Import complete/);
    assert.strictEqual(fs.existsSync(path.join(importWorkspace, 'skills')), true);
    assert.strictEqual(fs.existsSync(path.join(importWorkspace, 'hooks.json')), true);
  });

  // Search Command
  it('should search components with human and JSON output', () => {
    const humanRes = runCli('search kafka');
    assert.strictEqual(humanRes.status, 0);
    assert.match(humanRes.stdout, /apache-kafka-streams/);
    assert.match(humanRes.stdout, /Search Results for/);

    const jsonRes = runCli('search dbt --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.query, 'dbt');
    assert(data.results.skills.some(s => s.name === 'dbt-transformation'));
  });

  // Info for documentation-writer and v1.6.0 skills
  it('should display info for documentation-writer subagent and v1.6.0 skills', () => {
    const resDoc = runCli('info documentation-writer');
    assert.strictEqual(resDoc.status, 0);
    assert.match(resDoc.stdout, /Documentation Writer/);

    const resTurbo = runCli('info turborepo-monorepo');
    assert.strictEqual(resTurbo.status, 0);
    assert.match(resTurbo.stdout, /Turborepo/);

    const resRpc = runCli('info grpc-connect-rpc');
    assert.strictEqual(resRpc.status, 0);
    assert.match(resRpc.stdout, /Connect-RPC/);
  });

  // Benchmark Components Verification
  it('should report 60 components, 44 skills, and 9 subagents in benchmark --json', () => {
    const res = runCli('benchmark --json');
    assert.strictEqual(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert.strictEqual(data.totalComponents, 60, 'Total components should be 60');
    assert.strictEqual(data.progressiveSkillsCount, 44, 'Progressive skills should be 44');
    assert.strictEqual(data.scopedAgentsCount, 9, 'Scoped agents should be 9');
    assert.strictEqual(data.lifecycleHooksCount, 7, 'Lifecycle hooks should be 7');
  });

} finally {
  try {
    fs.rmSync(tempWorkspace, { recursive: true, force: true });
  } catch (_) {}
}

console.log(`\n✨ Test Run Finished: ${testsPassed} passed, ${testsFailed} failed.`);

if (testsFailed > 0) {
  process.exit(1);
}
