---
name: quantum-safe-cryptography
description: Implements NIST FIPS 203/204 Post-Quantum Cryptography (PQC) algorithms, hybrid TLS 1.3 key exchange, and quantum-resistant API authentication.
---

# Quantum-Safe Cryptography & Post-Quantum Cryptography (PQC)

Implements NIST Post-Quantum Cryptography standards (FIPS 203 ML-KEM / Kyber, FIPS 204 ML-DSA / Dilithium), hybrid classical-quantum TLS 1.3 key exchanges, and quantum-resistant authentication token signing for enterprise Gemini agent communications.

---

## 1. Architecture: Post-Quantum Security for AI Agents

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   HYBRID POST-QUANTUM SECURITY PIPELINE                     │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Agent Handshake & Mutual Authentication (mTLS 1.3)               │   │
│   │    • Classical: X25519 or ECDH (P-256)                              │   │
│   │    • Post-Quantum: ML-KEM-768 (Module-Lattice KEM / Kyber)          │   │
│   │    • Combined Shared Secret = KDF(Classical_SS || PQC_SS)           │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Quantum-Resistant Agent Token Signing (ML-DSA / Dilithium)       │   │
│   │    • Ephemeral agent delegation tokens signed via FIPS 204          │   │
│   │    • Immune to Shor's algorithm and "Harvest Now, Decrypt Later"    │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Cloud KMS & Google Cloud Hybrid Integration                      │   │
│   │    • Google Cloud Certificate Authority Service (CAS) PQC roots     │   │
│   │    • Vertex AI / Cloud Run encrypted ingress via X25519Kyber768     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. NIST Standardized PQC Specifications

| Standard | Algorithm Name | Purpose | Classical Equivalent | Key/Sig Sizes |
| :--- | :--- | :--- | :--- | :--- |
| **FIPS 203** | **ML-KEM-768** (Kyber) | Key Encapsulation (KEM) | RSA 3072 / ECDH P-256 | Public Key: 1,184 B, Ciphertext: 1,088 B |
| **FIPS 204** | **ML-DSA-65** (Dilithium) | Digital Signatures | ECDSA P-256 / Ed25519 | Public Key: 1,952 B, Signature: 3,309 B |
| **FIPS 205** | **SLH-DSA-128s** (SPHINCS+) | Stateless Hash-Based Signatures | Fallback Digital Signatures | Public Key: 32 B, Signature: 7,856 B |

---

## 3. Node.js & Web Cryptography Implementation

```javascript
import crypto from 'node:crypto';

// Verify runtime supports hybrid post-quantum cipher suites
export function getQuantumSafeCipherConfiguration() {
  const ciphers = crypto.getCiphers();
  const curves = crypto.getCurves ? crypto.getCurves() : [];
  
  const supportsKyber = curves.includes('X25519Kyber768Draft00') || curves.includes('x25519_kyber768');
  
  return {
    tlsVersion: 'TLSv1.3',
    ecdhCurve: supportsKyber ? 'X25519Kyber768Draft00:P-256' : 'auto',
    signatureAlgorithms: [
      'mldsa65',
      'ecdsa_secp256r1_sha256',
      'ed25519'
    ],
    pqcReady: supportsKyber
  };
}
```

---

## 4. Agent Migration Checklist

1. **Inventory Cryptographic Assets**: Audit all RSA 2048/4096 and ECDSA keys used for subagent authentication and webhook signing.
2. **Deploy Hybrid Key Exchange First**: Enable `X25519Kyber768` on all reverse proxies, load balancers, and Cloud Run agent endpoints. This protects against *Harvest Now, Decrypt Later* (HNDL) attacks with zero downtime.
3. **Upgrade Token Signatures**: Migrate internal agent JWTs to ML-DSA signatures with fallback validation for legacy clients.
