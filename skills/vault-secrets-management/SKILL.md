---
name: vault-secrets-management
description: >-
  Architects and automates HashiCorp Vault secrets management, AppRole machine authentication, dynamic ephemeral database credentials, and PKI mTLS certificate rotation.
---

# HashiCorp Vault Secrets Management & Ephemeral Credentials

This skill guides the design, automation, and operational patterns for HashiCorp Vault enterprise secrets orchestration, dynamic credential generation, and PKI certificate authority workflows.

---

## ⚡ Secret Engine Capabilities Matrix

| Secret Engine | Purpose | Lifecycle Behavior |
| :--- | :--- | :--- |
| **`kv-v2`** | Static credentials & API keys | Versioned key-value store with soft delete and rollback. |
| **`database`** | Ephemeral DB access (Postgres, MySQL) | Generates short-lived user credentials and revokes upon lease expiry. |
| **`pki`** | Internal mTLS & TLS certificates | Acts as CA/sub-CA; dynamically issues certificates in milliseconds. |
| **`transit`** | Cryptography as a service | Encrypts/decrypts data without exposing raw encryption keys. |

---

## 🔐 AppRole Machine Authentication Workflow

Applications authenticate using decoupled `role_id` and short-lived `secret_id`:

```bash
# 1. Enable AppRole auth method
vault auth enable approle

# 2. Configure service role with strict CIDR and token policies
vault write auth/approle/role/api-service \
    secret_id_ttl=60m \
    token_ttl=30m \
    token_max_ttl=4h \
    secret_id_num_uses=10 \
    token_policies="api-service-policy" \
    bind_secret_id=true

# 3. Retrieve Role ID (stored in deployment manifest)
vault read auth/approle/role/api-service/role-id

# 4. Generate Secret ID (delivered securely via CI/CD or orchestrator)
vault write -f auth/approle/role/api-service/secret-id
```

Node.js / Python authentication client:

```typescript
import axios from 'axios';

export async function loginWithAppRole(vaultAddr: string, roleId: string, secretId: string) {
  const response = await axios.post(`${vaultAddr}/v1/auth/approle/login`, {
    role_id: roleId,
    secret_id: secretId,
  });
  
  const clientToken = response.data.auth.client_token;
  const leaseDuration = response.data.auth.lease_duration;
  return { clientToken, leaseDuration };
}
```

---

## ⏳ Dynamic Ephemeral Database Credentials

Configure Vault to create temporary, unique PostgreSQL roles for each application instance:

```bash
# 1. Mount database engine
vault secrets enable database

# 2. Configure connection to PostgreSQL
vault write database/config/production-postgres \
    plugin_name=postgresql-database-plugin \
    allowed_roles="readwrite-service" \
    connection_url="postgresql://{{username}}:{{password}}@postgres:5432/production?sslmode=verify-full" \
    username="vaultadmin" \
    password="supersecretadminpassword"

# 3. Define role template with automated role creation SQL
vault write database/roles/readwrite-service \
    db_name=production-postgres \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"
```

Application requests credentials on demand:

```bash
vault read database/creds/readwrite-service
# Returns: username: v-approle-readwrite-abc123, password: xyz..., lease_id: database/creds/readwrite-service/xyz...
```

---

## 📜 PKI Dynamic mTLS Certificate Issuance

Automate TLS certificate issuance without manual CSR handling:

```bash
# Mount PKI engine and configure Root/Intermediate CA
vault secrets enable pki
vault secrets tune -max-lease-ttl=87600h pki

# Configure role for cluster services
vault write pki/roles/internal-mesh \
    allowed_domains="internal.cluster.local" \
    allow_subdomains=true \
    max_ttl="72h"

# Generate certificate on demand
vault write pki/issue/internal-mesh \
    common_name="billing-service.internal.cluster.local" \
    ttl="24h"
```

---

## 📋 Architectural Rules & Best Practices

1. **Never Hardcode Secrets**: Eliminate long-lived static DB passwords; adopt dynamic ephemeral database roles with short TTLs (< 2 hours).
2. **Strict Secret ID Binding**: Bind AppRole `secret_id` to expected subnet CIDRs (`secret_id_bound_cidrs`) to stop credential theft across VPCs.
3. **Lease Renewal & Heartbeats**: Background workers must periodically renew active leases (`vault write sys/leases/renew lease_id=...`) before expiry.
4. **Audit Logging**: Enable Vault audit devices (`vault audit enable file file_path=/var/log/vault/audit.log`) with hashed payload sanitization.
