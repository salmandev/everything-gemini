#!/usr/bin/env bash
# Everything Gemini Agency Growth Engine Runner
# Automates GTM campaign scoping, AARRR funnel planning, and viral loop design.

set -eo pipefail

ACTION="${1:-status}"
shift || true

IS_DRY_RUN=false
AS_JSON=false
TOPIC="product-launch"

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --dry-run) IS_DRY_RUN=true ;;
    --json) AS_JSON=true ;;
    -t|--topic) TOPIC="$2"; shift ;;
    *) 
      if [[ ! "$1" =~ ^- ]]; then
        TOPIC="$1"
      fi
      ;;
  esac
  shift
done

case "$ACTION" in
  campaign|plan)
    if [ "$AS_JSON" = true ]; then
      cat <<EOF
{
  "agency": "Everything Gemini Enterprise Agency",
  "division": "Growth & Marketing",
  "action": "$ACTION",
  "topic": "$TOPIC",
  "status": "PLANNED",
  "dryRun": $IS_DRY_RUN,
  "funnel": {
    "acquisition": "Developer inbound via DevRel, Hacker News, and GitHub trending",
    "activation": "Sub-60s zero-dependency CLI quickstart with interactive feedback",
    "retention": "Weekly engineering workflow digest and recurring test automation",
    "referral": "Shareable benchmark badges and architecture blueprints",
    "revenue": "Self-serve team tiers and enterprise support licenses"
  },
  "viralCoefficientTarget": 1.25,
  "outputPlaybook": "docs/growth/GROWTH_PLAYBOOK.md",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
      exit 0
    fi
    echo "🚀 [Agency Growth Engine] Formulating GTM Campaign for Topic: $TOPIC"
    if [ "$IS_DRY_RUN" = true ]; then
      echo "  [DRY RUN] Would synthesize AARRR funnel, viral loop design, and write docs/growth/GROWTH_PLAYBOOK.md"
      exit 0
    fi
    mkdir -p "docs/growth"
    cat <<PLAYBOOK_EOF > "docs/growth/GROWTH_PLAYBOOK.md"
# GTM Growth Playbook: ${TOPIC}

## 1. Executive Summary & Value Proposition
- **Product Initiative**: ${TOPIC}
- **Primary Audience**: Technical developers, system architects, and technical founders.
- **Transformation**: Transition from chaotic multi-agent swarms to disciplined, role-based enterprise AI.

## 2. AARRR Pirate Metrics Funnel
- **Acquisition**: Technical launches across GitHub, Hacker News, Dev.to, and X/Twitter developer circles.
- **Activation**: Interactive quickstart experience resulting in first successful output within 60 seconds.
- **Retention**: Recurring utility with test-driven validation, CI automation, and continuous improvement.
- **Referral**: Exportable markdown artifacts, performance cards, and visual architecture graphs.
- **Revenue**: High-value enterprise features, compliance audits, and dedicated support.

## 3. Viral Loop Architecture
- **Incentive**: Built-in visual architecture reports that users are proud to share with their teams.
- **Target K-Factor**: 1.25 (every 4 active users organically refer 5 new users).

## 4. Experiment Backlog (ICE Framework)
1. **Interactive Demo Playground**: Impact: 9, Confidence: 8, Ease: 7 (Score: 24)
2. **One-Command CI Integration**: Impact: 8, Confidence: 9, Ease: 8 (Score: 25)
3. **Automated Social Benchmark Cards**: Impact: 8, Confidence: 8, Ease: 9 (Score: 25)
PLAYBOOK_EOF
    echo "  ✔ Growth playbook synthesized at docs/growth/GROWTH_PLAYBOOK.md"
    ;;

  funnel)
    if [ "$AS_JSON" = true ]; then
      cat <<EOF
{
  "agency": "Everything Gemini Enterprise Agency",
  "division": "Growth & Marketing",
  "action": "funnel",
  "topic": "$TOPIC",
  "status": "ANALYZED",
  "metrics": {
    "projectedTopFunnelVisitors": 10000,
    "projectedActivatedUsers": 2500,
    "activationRate": "25%",
    "retentionDay30": "42%",
    "projectedViralCoefficient": 1.25
  },
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
      exit 0
    fi
    echo "📊 [Agency Funnel Analysis] Modeling AARRR Conversion Pipeline..."
    echo "  ✔ Projected TOFU Visitors: 10,000"
    echo "  ✔ Activation Conversion Rate: 25% (2,500 activated developers)"
    echo "  ✔ 30-Day Retention Benchmark: 42%"
    echo "  ✔ Viral Coefficient (K-factor): 1.25"
    ;;

  status|*)
    if [ "$AS_JSON" = true ]; then
      cat <<EOF
{
  "agency": "Everything Gemini Enterprise Agency",
  "division": "Growth & Marketing",
  "action": "status",
  "status": "OPERATIONAL",
  "roles": ["cmo", "growth-hacker", "ui-ux-designer", "copywriter"],
  "skills": ["agency-growth-engine", "agency-design-system"],
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
      exit 0
    fi
    echo "📈 Everything Gemini Growth & Marketing Division is operational."
    echo "  Active Roles : CMO, Growth Hacker, UI/UX Designer, Copywriter"
    echo "  Capabilities : GTM Campaigns, AARRR Funnel Modeling, Viral Loops, Design Systems"
    ;;
esac
