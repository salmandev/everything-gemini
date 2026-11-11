---
name: agency-growth-engine
description: Orchestrates end-to-end go-to-market (GTM) growth campaigns, AARRR pirate metric funnels, viral loop mechanics, and conversion rate optimization (CRO) for autonomous AI agencies. Use when launching a product, planning audience acquisition, defining viral loops, or optimizing onboarding conversion.
---

# Agency Growth Engine & Viral Funnel Orchestration

The `agency-growth-engine` skill provides a systematic, data-driven methodology for autonomous AI agencies to plan, execute, and measure product launches, audience acquisition funnels, and organic viral growth loops.

## Core Capabilities

1. **AARRR Pirate Funnel Engineering**:
   - **Acquisition**: Identifying high-converting inbound channels (DevRel, Hacker News, Product Hunt, technical SEO).
   - **Activation**: Defining the immediate "Aha!" moment and reducing Time-to-Value (TTV) under 60 seconds.
   - **Retention**: Behavioral notification loops, terminal milestones, and recurring utility value.
   - **Referral**: Viral coefficients ($K$-factor), organic artifact sharing, and referral incentives.
   - **Revenue**: Clear commercial pricing tiers, self-serve upgrades, and enterprise procurement gates.

2. **Growth Experimentation Framework (ICE Scoring)**:
   - Rank every growth idea on a 1-10 scale across:
     - **Impact**: Expected boost in primary acquisition or activation metric.
     - **Confidence**: Conviction based on user research or historical precedent.
     - **Ease**: Engineering speed and implementation simplicity.

3. **Autonomous Growth Runner**:
   - Automated CLI script in `scripts/agency-growth.sh` generating comprehensive launch playbooks, funnel projections, and multi-channel campaign directives.

## Step-by-Step Procedure

### 1. Define Campaign & Target ICP
Identify the product category, core problem solved, and primary audience:
- Target persona: Developers, Engineering Managers, Solo Founders, or Enterprise Architects.
- Value transformation: State before product vs. state after product.

### 2. Formulate the AARRR Funnel Architecture
Establish quantifiable targets for every funnel stage:
- **Top of Funnel (TOFU)**: Projected impressions and unique visitors.
- **Middle of Funnel (MOFU)**: Conversion to waitlist, install, or free tier signup ($\ge 5\%$).
- **Bottom of Funnel (BOFU)**: Weekly active usage and paid conversions.

### 3. Engineer Viral Sharing Loops
Embed natural sharing triggers into the product experience:
- Shareable benchmark cards and visual badges.
- One-click exportable architecture diagrams (Mermaid / SVG).
- Multiplayer collaboration invites.

### 4. Execute Campaign Automation
Run the bundled growth script:
```bash
# Preview growth campaign plan
bash skills/agency-growth-engine/scripts/agency-growth.sh campaign --topic "AI Developer Platform" --dry-run

# Generate full growth playbook in docs/growth/
bash skills/agency-growth-engine/scripts/agency-growth.sh campaign --topic "AI Developer Platform"

# Check growth engine status
bash skills/agency-growth-engine/scripts/agency-growth.sh status --json
```

## Best Practices
- **Never Rely on Vanity Metrics**: Focus strictly on Activated Users and Retained Trajectories rather than raw page views.
- **Instrument Telemetry First**: Ensure analytics events are wired before launching any marketing campaign.
- **Respect Privacy**: Enforce privacy-first, cookie-less analytics and zero deceptive dark patterns.

