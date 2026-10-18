---
name: dbt-transformation
description: >-
  Designs, develops, and tests modular SQL data transformations using dbt (data build tool), Jinja macros, semantic layer metrics, automated schema tests, and documentation generation.
---

# dbt Modular Transformation & Data Modeling

This skill guides structuring production-grade ELT pipelines using dbt (Core & Cloud), enforcing modular layer architecture (staging, intermediate, marts), DRY Jinja macros, automated data testing, and incremental table materialization.

---

## ⚡ Core Patterns

### 1. Multi-Layer Dimensional Modeling Architecture

Organize transformations into clean, progressive DAG layers:

```text
models/
├── staging/                     # 1:1 view on raw sources (renaming, casting)
│   ├── stripe/
│   │   ├── _stripe__sources.yml
│   │   ├── _stripe__models.yml
│   │   └── stg_stripe__payments.sql
├── intermediate/                # Business logic joins & window aggregations
│   └── finance/
│       ├── _int_finance__models.yml
│       └── int_payments_pivoted_to_orders.sql
└── marts/                       # Dimensional star schema (facts & dimensions)
    ├── core/
    │   ├── fct_orders.sql
    │   └── dim_customers.sql
    └── marketing/
        └── fct_campaign_conversions.sql
```

---

### 2. Staging Layer Model with CTE Standards

Clean raw source tables into normalized relational types:

```sql
-- models/staging/stripe/stg_stripe__payments.sql
with source as (
    select * from {{ source('stripe', 'payment') }}
),

renamed as (
    select
        id as payment_id,
        orderid as order_id,
        paymentmethod as payment_method,
        status as payment_status,
        -- Amount stored in cents; convert to dollars
        round(amount / 100.0, 2) as amount_usd,
        created as created_at
    from source
)

select * from renamed
```

Declare tests and column descriptions in accompanying YAML:

```yaml
# models/staging/stripe/_stripe__models.yml
version: 2

models:
  - name: stg_stripe__payments
    description: "Normalized payments table from Stripe webhook ingest."
    columns:
      - name: payment_id
        description: "Primary key for payment events."
        tests:
          - unique
          - not_null
      - name: payment_status
        tests:
          - accepted_values:
              values: ['success', 'fail', 'pending']
```

---

### 3. High-Performance Incremental Fact Table

Process only newly ingested or updated records using `is_incremental()`:

```sql
-- models/marts/core/fct_orders.sql
{{
    config(
        materialized='incremental',
        unique_key='order_id',
        incremental_strategy='merge',
        on_schema_change='fail'
    )
}}

with orders as (
    select * from {{ ref('stg_jaffle_shop__orders') }}
    {% if is_incremental() %}
        -- Only query rows created or modified in the last 3 days for backfill resilience
        where order_date >= (select dateadd('day', -3, max(order_date)) from {{ this }})
    {% endif %}
),

payments as (
    select * from {{ ref('stg_stripe__payments') }}
),

order_payments as (
    select
        order_id,
        sum(case when payment_status = 'success' then amount_usd else 0 end) as amount_usd
    from payments
    group by 1
),

final as (
    select
        orders.order_id,
        orders.customer_id,
        orders.order_date,
        orders.status as order_status,
        coalesce(order_payments.amount_usd, 0) as total_amount_usd
    from orders
    left join order_payments on orders.order_id = order_payments.order_id
)

select * from final
```

---

### 4. Custom Jinja Macro for Dynamic Pivoting

Avoid repetitive boilerplate using parameterized Jinja macros:

```sql
-- macros/pivot_sum.sql
{% macro pivot_sum(column_name, values_list, aggregate_col='amount_usd') %}
    {% for val in values_list %}
        sum(case when {{ column_name }} = '{{ val }}' then {{ aggregate_col }} else 0 end) as {{ val }}_amount
        {% if not loop.last %},{% endif %}
    {% endfor %}
{% endmacro %}
```

Usage in intermediate model:

```sql
select
    order_id,
    {{ pivot_sum('payment_method', ['credit_card', 'coupon', 'bank_transfer', 'gift_card']) }}
from {{ ref('stg_stripe__payments') }}
group by 1
```

---

## 🎯 Verification & Diagnostics

1. **Compile SQL with Resolved Jinja**:
   ```bash
   dbt compile --select fct_orders
   ```
2. **Execute Targeted Subgraph**:
   ```bash
   dbt run --select +fct_orders       # Run fct_orders and all upstream dependencies
   dbt test --select stg_stripe+      # Test staging models and downstream marts
   ```
3. **Build Documentation & DAG Visualizer**:
   ```bash
   dbt docs generate && dbt docs serve
   ```
