---
name: opa-gatekeeper-policy
description: Authors and validates Open Policy Agent (OPA) Gatekeeper ConstraintTemplates and Rego admission policies for Kubernetes governance and security compliance.
---

# OPA Gatekeeper Policy

Defines declarative policy enforcement for Kubernetes clusters using Open Policy Agent (OPA) Gatekeeper ConstraintTemplates, Rego logic, and shift-left CLI testing.

---

## 1. Admission Control Flow

```
 kubectl apply -f resource.yaml
            │
            ▼
┌────────────────────────┐
│ Kubernetes API Server  │
└───────────┬────────────┘
            │ ValidatingWebhookConfiguration
            ▼
┌────────────────────────┐      Matches Rules?
│   Gatekeeper Pod       │────────────────────────┐
│  (Admission Webhook)   │                        │
└───────────┬────────────┘                        ▼
            │ Rego Evaluation          ┌────────────────────┐
            ▼                          │ Reject (403)       │
 ┌──────────────────────┐              │ Error & Remediation│
 │ Constraint Templates │              └────────────────────┘
 └──────────┬───────────┘
            │ Passed
            ▼
 ┌──────────────────────┐
 │ Persist to etcd      │
 └──────────────────────┘
```

---

## 2. ConstraintTemplate (Rego Engine)

Defines the reusable policy schema and Rego execution logic:

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
  annotations:
    description: "Requires all namespaces and workloads to specify standard governance labels."
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels

        violation[{"msg": msg, "details": {"missing_labels": missing}}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("Resource %v '%v' violates policy: missing required labels: %v", [
            input.review.object.kind,
            input.review.object.metadata.name,
            missing
          ])
        }
```

---

## 3. Instantiating the Constraint

Applies the template to specific resource kinds and namespaces:

```yaml
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: require-team-and-cost-center
spec:
  enforcementAction: deny # Options: deny, dryrun, warn
  match:
    kinds:
      - apiGroups: ["apps"]
        kinds: ["Deployment", "StatefulSet"]
      - apiGroups: [""]
        kinds: ["Namespace"]
    excludedNamespaces:
      - kube-system
      - gatekeeper-system
  parameters:
    labels:
      - "app.kubernetes.io/managed-by"
      - "cost-center"
      - "owner-team"
```

---

## 4. Container Security Constraint (Disallow Privileged)

Enforces zero-trust rootless containers:

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8sdisallowprivileged
spec:
  crd:
    spec:
      names:
        kind: K8sDisallowPrivileged
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8sdisallowprivileged

        violation[{"msg": msg}] {
          c := input_containers[_]
          c.securityContext.privileged == true
          msg := sprintf("Privileged container '%v' is prohibited in namespace '%v'.", [
            c.name,
            input.review.object.metadata.namespace
          ])
        }

        input_containers[c] {
          c := input.review.object.spec.template.spec.containers[_]
        }
        input_containers[c] {
          c := input.review.object.spec.template.spec.initContainers[_]
        }
```

---

## 5. Shift-Left CI Validation with `gator` CLI

Validates Kubernetes manifests against Gatekeeper templates inside CI pipelines before merge:

```bash
# Test manifests directly without a live Kubernetes cluster
gator test \
  --image-template=./templates/ \
  --constraint=./constraints/ \
  --manifests=./deploy/production/

# Run unit tests on Rego source files
gator verify ./policies/...
```

```yaml
# Gator test suite definition (suite.yaml)
kind: Suite
apiVersion: test.gatekeeper.sh/v1alpha1
metadata:
  name: deployment-label-suite
tests:
  - name: test-missing-labels-denied
    template: template.yaml
    constraint: constraint.yaml
    cases:
      - name: deployment-without-cost-center
        object: bad-deployment.yaml
        assertions:
          - violations: yes
            message: "missing required labels: {\"cost-center\"}"
      - name: compliant-deployment
        object: good-deployment.yaml
        assertions:
          - violations: no
```

---

## 6. Audit Cluster Violations

```bash
# Inspect non-compliant resources identified during continuous background audit
kubectl get constraints -A

# Detailed violation listing
kubectl get k8srequiredlabels.constraints.gatekeeper.sh require-team-and-cost-center -o yaml \
  | yq '.status.violations[] | {resource: .name, kind: .kind, message: .message}'
```
