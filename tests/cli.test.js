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
  assert.strictEqual(data.totalComponents, 45);
  assert.strictEqual(data.progressiveSkillsCount, 33);
  assert.strictEqual(data.scopedAgentsCount, 6);
  assert.strictEqual(data.lifecycleHooksCount, 6);
  assert(data.totalRunbookTokens > 10000, 'Expected >10,000 runbook tokens');
  assert(data.estimatedTokensSavedPerTurn > 5000, 'Expected significant token savings');
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

} finally {
  try {
    fs.rmSync(tempWorkspace, { recursive: true, force: true });
  } catch (_) {}
}

console.log(`\n✨ Test Run Finished: ${testsPassed} passed, ${testsFailed} failed.`);

if (testsFailed > 0) {
  process.exit(1);
}
