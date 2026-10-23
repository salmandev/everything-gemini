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
  assert.strictEqual(data.totalComponents, 121);
  assert.strictEqual(data.progressiveSkillsCount, 92);
  assert.strictEqual(data.scopedAgentsCount, 17);
  assert.strictEqual(data.lifecycleHooksCount, 12);
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

  // Audit Command
  it('should audit workspace and catalog with human and JSON output', () => {
    const humanRes = runCli('audit .');
    assert.strictEqual(humanRes.status, 0);
    assert.match(humanRes.stdout, /Everything Gemini Ecosystem Audit Report/);
    assert.match(humanRes.stdout, /ALL CHECKS PASSED/);

    const jsonRes = runCli('audit . --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.valid, true);
    assert.strictEqual(data.errorCount, 0);
    assert(data.passedCount > 50, 'Audit should run at least 50 checks');
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

  // Info for release-engineer and v1.7.0 skills
  it('should display info for release-engineer subagent and v1.7.0 skills', () => {
    const resRel = runCli('info release-engineer');
    assert.strictEqual(resRel.status, 0);
    assert.match(resRel.stdout, /Release Engineer/);

    const resLang = runCli('info langgraph-orchestrator');
    assert.strictEqual(resLang.status, 0);
    assert.match(resLang.stdout, /LangGraph/);

    const resOtel = runCli('info open-telemetry-tracing');
    assert.strictEqual(resOtel.status, 0);
    assert.match(resOtel.stdout, /OpenTelemetry/);
  });

  // Bundle Command
  it('should package offline distribution bundle in dry-run and live modes', () => {
    const bundleTarget = path.join(tempWorkspace, 'test-bundle');

    // Dry-run mode
    const dryRes = runCli(`bundle --output "${bundleTarget}" --dry-run`);
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /DRY RUN MODE ACTIVATED/);
    assert.match(dryRes.stdout, /Skills to bundle: 92/);
    assert.strictEqual(fs.existsSync(bundleTarget), false, 'Dry run should not create destination directory');

    // JSON Dry-run mode
    const jsonRes = runCli(`bundle --output "${bundleTarget}" --dry-run --json`);
    assert.strictEqual(jsonRes.status, 0);
    const dryData = JSON.parse(jsonRes.stdout);
    assert.strictEqual(dryData.dryRun, true);
    assert.strictEqual(dryData.manifest.components.totalCount, 121);

    // Live mode
    const liveRes = runCli(`bundle --output "${bundleTarget}"`);
    assert.strictEqual(liveRes.status, 0);
    assert.match(liveRes.stdout, /Offline Distribution Bundle Created/);
    assert.strictEqual(fs.existsSync(path.join(bundleTarget, 'bundle-manifest.json')), true);
    assert.strictEqual(fs.existsSync(path.join(bundleTarget, 'offline-install.sh')), true);
    assert.strictEqual(fs.existsSync(path.join(bundleTarget, 'skills', 'milvus-vector-clustering')), true);
    assert.strictEqual(fs.existsSync(path.join(bundleTarget, 'agents', 'platform-engineer.md')), true);
  });

  // Scaffold Command
  it('should scaffold skill, agent, and hook in dry-run and live modes', () => {
    const scaffoldWorkspace = path.join(tempWorkspace, 'scaffold-ws');

    // Skill Dry-run
    const drySkill = runCli(`scaffold skill demo-test-skill --workspace "${scaffoldWorkspace}" --dry-run --json`);
    assert.strictEqual(drySkill.status, 0);
    const drySkillData = JSON.parse(drySkill.stdout);
    assert.strictEqual(drySkillData.isDryRun, true);
    assert.strictEqual(drySkillData.type, 'skill');

    // Live Agent Scaffold
    const liveAgent = runCli(`scaffold agent demo-qa-agent --workspace "${scaffoldWorkspace}"`);
    assert.strictEqual(liveAgent.status, 0);
    assert.match(liveAgent.stdout, /Created subagent profile/);
    assert.strictEqual(fs.existsSync(path.join(scaffoldWorkspace, 'agents', 'demo-qa-agent.md')), true);

    // Live Hook Scaffold
    const liveHook = runCli(`scaffold hook demo-safety --workspace "${scaffoldWorkspace}"`);
    assert.strictEqual(liveHook.status, 0);
    assert.match(liveHook.stdout, /Created lifecycle hook/);
    assert.strictEqual(fs.existsSync(path.join(scaffoldWorkspace, 'hooks', 'demo-safety', 'hooks.json')), true);
    assert.strictEqual(fs.existsSync(path.join(scaffoldWorkspace, 'hooks', 'demo-safety', 'scripts', 'demo-safety-gate.sh')), true);
  });

  // Sync Command
  it('should synchronize workspace with sync command in dry-run and live modes', () => {
    // Dry-run
    const drySync = runCli(`sync --workspace "${tempWorkspace}" --dry-run`);
    assert.strictEqual(drySync.status, 0);
    assert.match(drySync.stdout, /DRY RUN MODE ACTIVATED/);
    assert.match(drySync.stdout, /Synchronizing Workspace with Catalog/);

    // JSON Dry-run
    const jsonSync = runCli(`sync --workspace "${tempWorkspace}" --dry-run --json`);
    assert.strictEqual(jsonSync.status, 0);
    const syncData = JSON.parse(jsonSync.stdout);
    assert.strictEqual(syncData.isDryRun, true);
    assert.strictEqual(syncData.success, true);
  });

  // Info for incident-responder and v1.8.0 skills
  it('should display info for incident-responder subagent and v1.8.0 skills', () => {
    const resInc = runCli('info incident-responder');
    assert.strictEqual(resInc.status, 0);
    assert.match(resInc.stdout, /Incident Responder/);

    const resVllm = runCli('info vllm-inference');
    assert.strictEqual(resVllm.status, 0);
    assert.match(resVllm.stdout, /vLLM/);

    const resCdc = runCli('info debezium-cdc');
    assert.strictEqual(resCdc.status, 0);
    assert.match(resCdc.stdout, /Debezium/);

    const resCilium = runCli('info cilium-ebpf-networking');
    assert.strictEqual(resCilium.status, 0);
    assert.match(resCilium.stdout, /Cilium/);

    const resLite = runCli('info litellm-proxy-gateway');
    assert.strictEqual(resLite.status, 0);
    assert.match(resLite.stdout, /LiteLLM/);
  });

  // Info for platform-engineer and v1.9.0 skills
  it('should display info for platform-engineer subagent and v1.9.0 skills', () => {
    const resPlat = runCli('info platform-engineer');
    assert.strictEqual(resPlat.status, 0);
    assert.match(resPlat.stdout, /Platform Engineer/);

    const resMilvus = runCli('info milvus-vector-clustering');
    assert.strictEqual(resMilvus.status, 0);
    assert.match(resMilvus.stdout, /Milvus/);

    const resR2 = runCli('info cloudflare-r2-object-storage');
    assert.strictEqual(resR2.status, 0);
    assert.match(resR2.stdout, /Cloudflare R2/);

    const resVault = runCli('info vault-secrets-management');
    assert.strictEqual(resVault.status, 0);
    assert.match(resVault.stdout, /Vault/);

    const resRate = runCli('info distributed-rate-limiting');
    assert.strictEqual(resRate.status, 0);
    assert.match(resRate.stdout, /Distributed Rate Limiting/);
  });

  // Info for mlops-engineer and v2.0.0 skills
  it('should display info for mlops-engineer subagent and v2.0.0 skills', () => {
    const resMl = runCli('info mlops-engineer');
    assert.strictEqual(resMl.status, 0);
    assert.match(resMl.stdout, /MLOps Engineer/);

    const resKeda = runCli('info keda-event-autoscaling');
    assert.strictEqual(resKeda.status, 0);
    assert.match(resKeda.stdout, /KEDA/);

    const resChroma = runCli('info chromadb-vector-store');
    assert.strictEqual(resChroma.status, 0);
    assert.match(resChroma.stdout, /ChromaDB/);

    const resOpa = runCli('info opa-gatekeeper-policy');
    assert.strictEqual(resOpa.status, 0);
    assert.match(resOpa.stdout, /Gatekeeper/);

    const resTriton = runCli('info triton-inference-server');
    assert.strictEqual(resTriton.status, 0);
    assert.match(resTriton.stdout, /Triton/);
  });

  // Info for v2.1.0 Google Research Harness2 & Google Family skills
  it('should display info for v2.1.0 Harness2, Google Flow, and Dataproc Spark skills', () => {
    const resH2 = runCli('info harness2-recursive-optimization');
    assert.strictEqual(resH2.status, 0);
    assert.match(resH2.stdout, /Harness² Recursive Optimization/);

    const resFlow = runCli('info google-flow-orchestrator');
    assert.strictEqual(resFlow.status, 0);
    assert.match(resFlow.stdout, /Google Flow Orchestrator/);

    const resSpark = runCli('info dataproc-spark-analytics');
    assert.strictEqual(resSpark.status, 0);
    assert.match(resSpark.stdout, /Dataproc Spark Analytics/);
  });

  // Harness2 command and export format verification
  it('should synthesize Google Research Harness2 workspace in dry-run, live, and JSON export modes', () => {
    const h2Target = path.join(tempWorkspace, 'harness2-test-ws');

    // Dry-run mode
    const dryRes = runCli(`harness2 "${h2Target}" --dry-run`);
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /DRY RUN MODE ACTIVATED/);
    assert.match(dryRes.stdout, /Previewing Google Research Harness² Surfaces/);
    assert.strictEqual(fs.existsSync(h2Target), false, 'Dry run should not create destination directory');

    // JSON Dry-run mode
    const jsonRes = runCli(`harness2 "${h2Target}" --dry-run --json`);
    assert.strictEqual(jsonRes.status, 0);
    const dryData = JSON.parse(jsonRes.stdout);
    assert.strictEqual(dryData.dryRun, true);
    assert.strictEqual(dryData.manifest.metrics.total_skills, 92);
    assert.strictEqual(dryData.manifest.metrics.total_subagents, 17);
    assert.strictEqual(dryData.manifest.metrics.total_hooks, 12);

    // Live mode
    const liveRes = runCli(`harness2 "${h2Target}"`);
    assert.strictEqual(liveRes.status, 0);
    assert.match(liveRes.stdout, /Google Research Harness² Workspace Synthesized Successfully/);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'harness.yaml')), true);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'harness.json')), true);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'prompts', 'GEMINI.md')), true);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'memory', 'memory_spec.json')), true);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'guidance', 'tool_selection_rules.md')), true);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'subagents', 'planner.md')), true);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'skills', 'harness2-recursive-optimization', 'SKILL.md')), true);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'scripts', 'harness_probe.sh')), true);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'scripts', 'harness_snapshot.sh')), true);
    assert.strictEqual(fs.existsSync(path.join(h2Target, 'scripts', 'harness_rollback.sh')), true);

    // Export with --format harness2
    const h2ExportTarget = path.join(tempWorkspace, 'harness2-export-ws');
    const exportRes = runCli(`export --format harness2 --output "${h2ExportTarget}"`);
    assert.strictEqual(exportRes.status, 0);
    assert.strictEqual(fs.existsSync(path.join(h2ExportTarget, 'harness.yaml')), true);
  });

  // Graph command verification
  it('should render interaction graph in terminal, mermaid, and JSON formats', () => {
    const resTerm = runCli('graph');
    assert.strictEqual(resTerm.status, 0);
    assert.match(resTerm.stdout, /Multi-Agent Topology & Dependency Graph/);
    assert.match(resTerm.stdout, /MLOPS-ENGINEER/);

    const resMermaid = runCli('graph --mermaid');
    assert.strictEqual(resMermaid.status, 0);
    assert.match(resMermaid.stdout, /graph TD/);
    assert.match(resMermaid.stdout, /A_mlops_engineer/);

    const resJson = runCli('graph --json');
    assert.strictEqual(resJson.status, 0);
    const data = JSON.parse(resJson.stdout);
    assert.ok(data.totalNodes > 50, 'Graph should contain > 50 nodes');
    assert.ok(data.totalEdges > 50, 'Graph should contain > 50 edges');
    assert.ok(data.nodes.find(n => n.id === 'agent:mlops-engineer'));
  });

  // Benchmark Components Verification
  it('should report 121 components, 92 skills, 17 subagents, and 12 hooks in benchmark --json', () => {
    const res = runCli('benchmark --json');
    assert.strictEqual(res.status, 0);
    const data = JSON.parse(res.stdout);
    assert.strictEqual(data.totalComponents, 121, 'Total components should be 121');
    assert.strictEqual(data.progressiveSkillsCount, 92, 'Progressive skills should be 92');
    assert.strictEqual(data.scopedAgentsCount, 17, 'Scoped agents should be 17');
    assert.strictEqual(data.lifecycleHooksCount, 12, 'Lifecycle hooks should be 12');
  });

  // Harness² Run & Ingest-Trace tests
  it('should support harness2 run with local benchmark, hard spend limits, and dry-run/json modes', () => {
    const testTasksDir = path.join(tempWorkspace, 'harness2-tasks');
    // Dry-run mode
    const dryRes = runCli(`harness2 run --dir "${testTasksDir}" --bench local --max-usd 15 --dry-run`);
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /DRY RUN MODE ACTIVATED/);
    assert.match(dryRes.stdout, /Spend Ceiling: \$15\.00 USD/);

    // JSON export mode
    const jsonRes = runCli(`harness2 run --dir "${testTasksDir}" --bench local --max-usd 25 --json`);
    assert.strictEqual(jsonRes.status, 0);
    const runData = JSON.parse(jsonRes.stdout);
    assert.strictEqual(runData.engine, 'everything-gemini-harness2-runner');
    assert.strictEqual(runData.benchmark, 'local');
    assert.strictEqual(runData.spendGuardrail.maxSpendUsd, 25);
    assert.strictEqual(runData.result.status, 'PASSED');
  });

  it('should support harness2 ingest-trace to generate automated regression probes', () => {
    const sampleTracePath = path.join(tempWorkspace, 'production-failure.json');
    fs.writeFileSync(sampleTracePath, JSON.stringify({
      id: 'trace-spark-oom',
      error: 'OutOfMemoryError: Container killed due to 16GB memory ceiling',
      tool: 'dataproc-spark-analytics',
      timestamp: '2026-10-19T18:00:00Z',
      stack: 'Fatal: JVM worker heap exhausted at SparkExecutor.scala:42'
    }, null, 2), 'utf8');

    const traceOutDir = path.join(tempWorkspace, 'regression-tasks');
    const ingestRes = runCli(`harness2 ingest-trace "${sampleTracePath}" --dir "${traceOutDir}"`);
    assert.strictEqual(ingestRes.status, 0);
    assert.match(ingestRes.stdout, /Production Trace Ingested into Harness² Regression Test/);

    const generatedTask = path.join(traceOutDir, 'regression-trace-spark-oom.json');
    assert.strictEqual(fs.existsSync(generatedTask), true);
    const taskContent = JSON.parse(fs.readFileSync(generatedTask, 'utf8'));
    assert.strictEqual(taskContent.id, 'regression-trace-spark-oom');
    assert.strictEqual(taskContent.sourceTrace, 'production-failure.json');
    assert.match(taskContent.errorCategory, /OutOfMemoryError/);
  });

  it('should display info for budget-guard lifecycle hook', () => {
    const res = runCli('info budget-guard');
    assert.strictEqual(res.status, 0);
    assert.match(res.stdout, /budget-guard/);
    assert.match(res.stdout, /PreToolUse/);
  });

  it('should display info for context-warmer skill and human-gate hook', () => {
    const resSkill = runCli('info context-warmer');
    assert.strictEqual(resSkill.status, 0);
    assert.match(resSkill.stdout, /context-warmer/);

    const resHook = runCli('info human-gate');
    assert.strictEqual(resHook.status, 0);
    assert.match(resHook.stdout, /human-gate/);
    assert.match(resHook.stdout, /PreToolUse/);
  });

  it('should display info for v2.2.0 skills (bigquery-vector-search, cloud-run-agents, pubsub-event-mesh, spanner-graph-rag)', () => {
    for (const skill of ['bigquery-vector-search', 'cloud-run-agents', 'pubsub-event-mesh', 'spanner-graph-rag']) {
      const res = runCli(`info ${skill}`);
      assert.strictEqual(res.status, 0);
      assert.match(res.stdout, new RegExp(skill));
    }
  });

  // Pre-flight Cost Oracle
  it('should support estimate command in dry-run and json modes', () => {
    const dryRes = runCli('estimate --dry-run');
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /Pre-Flight Cost Oracle/);
    assert.match(dryRes.stdout, /gemini-2\.0-flash/);
    assert.match(dryRes.stdout, /FinOps Recommendation/);

    const jsonRes = runCli('estimate --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(typeof data.filesAnalyzed, 'number');
    assert.strictEqual(typeof data.progressiveSavingsPercent, 'number');
    assert.ok(data.models['gemini-2.0-flash']);
    assert.ok(data.models['gemini-3.8-extended-thinking']);
  });

  // Harness³ Darwin Engine & Auto-Bench
  it('should support harness3 auto-bench in dry-run and json modes', () => {
    const dryRes = runCli('harness3 auto-bench --dry-run');
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /Harness³: Autonomous Agentic Darwinism/);
    assert.match(dryRes.stdout, /Pareto Optimal/);

    const jsonRes = runCli('harness3 --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.engine, 'Harness³ Genetic Darwinism & Auto-Bench');
    assert.strictEqual(data.paretoWinningSurface.paretoOptimal, true);
    assert.ok(data.candidates.length >= 5);
  });

  // Visual Mission Control UI
  it('should support ui mission control in dry-run and json modes', () => {
    const dryRes = runCli('ui --dry-run');
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /Visual Mission Control/);
    assert.match(dryRes.stdout, /DRY RUN MODE ACTIVATED/);

    const jsonRes = runCli('ui --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.metrics.totalComponents, 121);
    assert.strictEqual(data.metrics.progressiveSkills, 92);
    assert.ok(data.endpoints.dashboard);
  });

  // v2.3.0 Skills Info Verification
  it('should display info for v2.3.0 skills (gemini-live-multimodal, cost-oracle-finops, vertex-ai-feature-store, spanner-change-streams)', () => {
    for (const skill of ['gemini-live-multimodal', 'cost-oracle-finops', 'vertex-ai-feature-store', 'spanner-change-streams']) {
      const res = runCli(`info ${skill}`);
      assert.strictEqual(res.status, 0);
      assert.match(res.stdout, new RegExp(skill));
    }
  });

  // v2.4.0 Swarm Command
  it('should support swarm command in dry-run and json modes', () => {
    const dryRes = runCli('swarm spawn "test refactor" --workers 3 --dry-run');
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /Ephemeral Swarm Intelligence/);
    assert.match(dryRes.stdout, /DRY RUN MODE ACTIVATED|Dry run complete/);

    const jsonRes = runCli('swarm --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.workerCount, 3);
    assert.strictEqual(data.topology, 'hierarchical');
    assert.strictEqual(data.reclamation.status, 'reclaimed_clean');
  });

  // v2.4.0 Thinking Command
  it('should support thinking command in dry-run and json modes', () => {
    const dryRes = runCli('thinking budget --level deep --dry-run');
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /Dynamic Thinking Allocation/);
    assert.match(dryRes.stdout, /Dry run complete/);

    const jsonRes = runCli('thinking --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.cognitiveLevel, 'Deep Reasoning');
    assert.strictEqual(data.recommendedModel, 'gemini-3.8-extended-thinking');
    assert.strictEqual(data.allocatedThinkingTokens, 16384);
  });

  // v2.4.0 Skills Info Verification
  it('should display info for v2.4.0 skills (ephemeral-swarm-orchestrator, dynamic-thinking-allocation, ebpf-sandbox-enforcer, quantum-safe-cryptography)', () => {
    for (const skill of ['ephemeral-swarm-orchestrator', 'dynamic-thinking-allocation', 'ebpf-sandbox-enforcer', 'quantum-safe-cryptography']) {
      const res = runCli(`info ${skill}`);
      assert.strictEqual(res.status, 0);
      assert.match(res.stdout, new RegExp(skill));
    }
  });

  // v2.4.0 Subagent & Hook Info Verification
  it('should display info for swarm-coordinator subagent and thinking-budget hook', () => {
    const agentRes = runCli('info swarm-coordinator');
    assert.strictEqual(agentRes.status, 0);
    assert.match(agentRes.stdout, /swarm-coordinator/);

    const hookRes = runCli('info thinking-budget');
    assert.strictEqual(hookRes.status, 0);
    assert.match(hookRes.stdout, /thinking-budget/);
  });

  // v2.5.0 Resilience Command
  it('should support resilience command in dry-run and json modes', () => {
    const dryRes = runCli('resilience run --iterations 10 --dry-run');
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /Harness³ Mutation Testing & Chaos Resilience Engine/);
    assert.match(dryRes.stdout, /Dry run complete/);

    const jsonRes = runCli('resilience --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.verdict, 'PASSED_PRODUCTION_CERTIFIED');
    assert.ok(data.faultMatrix.length >= 5);
    assert.strictEqual(data.circuitBreaker.status, 'active');
  });

  // v2.5.0 Telemetry Command
  it('should support telemetry command in dry-run and json modes', () => {
    const dryRes = runCli('telemetry status --dry-run');
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /OpenTelemetry GenAI Observability/);
    assert.match(dryRes.stdout, /Dry run complete/);

    const jsonRes = runCli('telemetry --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.semanticConventions, 'OpenTelemetry GenAI v1.30+');
    assert.ok(data.spans.length >= 4);
    assert.strictEqual(data.tokenMetrics.thinkingTokens, 20480);
  });

  // v2.5.0 Skills Info Verification
  it('should display info for v2.5.0 skills (webrtc-agent-gateway, opentelemetry-agent-observability, harness3-mutation-testing, envoy-ai-gateway)', () => {
    for (const skill of ['webrtc-agent-gateway', 'opentelemetry-agent-observability', 'harness3-mutation-testing', 'envoy-ai-gateway']) {
      const res = runCli(`info ${skill}`);
      assert.strictEqual(res.status, 0);
      assert.match(res.stdout, new RegExp(skill));
    }
  });

  // v2.5.0 Subagent & Hook Info Verification
  it('should display info for resilience-engineer subagent and drift-detector hook', () => {
    const agentRes = runCli('info resilience-engineer');
    assert.strictEqual(agentRes.status, 0);
    assert.match(agentRes.stdout, /resilience-engineer/);

    const hookRes = runCli('info drift-detector');
    assert.strictEqual(hookRes.status, 0);
    assert.match(hookRes.stdout, /drift-detector/);
  });

  // v2.6.0 Cross-Repo Command
  it('should support cross-repo command in dry-run and json modes', () => {
    const dryRes = runCli('cross-repo sync --dry-run');
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /Cross-Repository Swarm Synchronization/);
    assert.match(dryRes.stdout, /Dry run complete/);

    const jsonRes = runCli('cross-repo --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.twoPhaseCommitState, 'PREPARED');
    assert.ok(data.repositories.length >= 3);
    assert.ok(data.eventMesh.topic);
  });

  // v2.6.0 Compact Command
  it('should support compact command in dry-run and json modes', () => {
    const dryRes = runCli('compact analyze --dry-run');
    assert.strictEqual(dryRes.status, 0);
    assert.match(dryRes.stdout, /Context Distillation & Semantic Compaction/);
    assert.match(dryRes.stdout, /Dry run complete/);

    const jsonRes = runCli('compact --ast --json');
    assert.strictEqual(jsonRes.status, 0);
    const data = JSON.parse(jsonRes.stdout);
    assert.strictEqual(data.astSkeletalization, true);
    assert.ok(data.metrics.originalTokens > 0);
    assert.ok(data.compactionStrategies.length >= 3);
  });

  // v2.6.0 Skills Info Verification
  it('should display info for v2.6.0 skills (cross-repo-swarm-sync, ebpf-microvm-sandbox, context-distillation-compressor, speculative-decoding-orchestrator)', () => {
    for (const skill of ['cross-repo-swarm-sync', 'ebpf-microvm-sandbox', 'context-distillation-compressor', 'speculative-decoding-orchestrator']) {
      const res = runCli(`info ${skill}`);
      assert.strictEqual(res.status, 0);
      assert.match(res.stdout, new RegExp(skill));
    }
  });

  // v2.6.0 Subagent & Hook Info Verification
  it('should display info for cross-repo-orchestrator subagent and context-compactor hook', () => {
    const agentRes = runCli('info cross-repo-orchestrator');
    assert.strictEqual(agentRes.status, 0);
    assert.match(agentRes.stdout, /cross-repo-orchestrator/);

    const hookRes = runCli('info context-compactor');
    assert.strictEqual(hookRes.status, 0);
    assert.match(hookRes.stdout, /context-compactor/);
  });

  // PHP2Shell Version Checker & Skill Suite
  it('should audit remote URLs or local server with phpcheck subcommand', () => {
    const helpRes = runCli('phpcheck --help');
    assert.strictEqual(helpRes.status, 0);
    assert.match(helpRes.stdout, /PHP2Shell Patch Checker/);
    assert.match(helpRes.stdout, /CVE-2026-109618/);

    const serverRes = runCli('phpcheck --server --json');
    assert.ok(serverRes.status === 0 || serverRes.status === 3);
    const serverData = JSON.parse(serverRes.stdout);
    assert.ok(Array.isArray(serverData.cves));
    assert.ok(serverData.patch_status);

    for (const skill of ['phpcheck-url', 'phpcheck-server', 'php2shell-version-auditor', 'cve-remediation-orchestrator']) {
      const infoRes = runCli(`info ${skill}`);
      assert.strictEqual(infoRes.status, 0);
      assert.match(infoRes.stdout, new RegExp(skill));
    }

    const { versionStatus } = require(path.join(REPO_ROOT, 'skills', 'phpcheck-url', 'scripts', 'phpcheck.js'));
    assert.strictEqual(versionStatus('8.2.34'), 'potentially_vulnerable');
    assert.strictEqual(versionStatus('8.2.35'), 'ok');
    assert.strictEqual(versionStatus('8.3.35'), 'potentially_vulnerable');
    assert.strictEqual(versionStatus('8.3.36'), 'ok');
    assert.strictEqual(versionStatus('8.4.26'), 'potentially_vulnerable');
    assert.strictEqual(versionStatus('8.4.27'), 'ok');
    assert.strictEqual(versionStatus('8.5.11'), 'potentially_vulnerable');
    assert.strictEqual(versionStatus('8.5.12'), 'ok');
    assert.strictEqual(versionStatus('8.1.35'), 'potentially_vulnerable');
    assert.strictEqual(versionStatus('7.4.33'), 'potentially_vulnerable');
    assert.strictEqual(versionStatus('8.3.0-dev'), 'unknown');
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
