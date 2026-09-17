# ExternalName (External DNS) Service — Bridging Outside Infrastructure

## 1. What is an ExternalName Service?
An `ExternalName` service is a unique type of Kubernetes Service that has **no selectors, no pods, and no ClusterIP address**.

Instead of routing network packets through `kube-proxy`, an `ExternalName` service acts as an **internal DNS CNAME alias** managed by CoreDNS. When an application inside the cluster queries the service name, CoreDNS returns a `CNAME` record pointing directly to an external fully qualified domain name (FQDN) outside the cluster.

---

## 2. Why Do We Need ExternalName? (The Problem It Solves)

### The Problem: Hardcoded External URLs in Application Code
Imagine your frontend application connects to an AWS RDS database:
* In Development: database is `dev-db.local`
* In Staging: database is `staging-postgres.company.internal`
* In Production: database is `prod-aurora-cluster.c484930.us-east-1.rds.amazonaws.com`

If you hardcode these external URLs across 20 microservices, changing database endpoints or migrating cloud providers requires editing code, rebuilding container images, and redeploying all services.

### The Solution: An Unchanging Internal DNS Alias
Your application code always connects to:
```text
http://external-database-service
```
Kubernetes CoreDNS redirects that internal query to whatever external hostname is configured in the `ExternalName` manifest. To switch databases, you simply update the Kubernetes YAML without touching your application code.

```text
+-------------------------------------------------------------+
| Kubernetes Cluster                                          |
|                                                             |
|   +---------------+                                         |
|   | App Pod       |                                         |
|   +---------------+                                         |
|          |                                                  |
|          | 1. DNS Query: "external-database-service"        |
|          v                                                  |
|   +---------------+                                         |
|   | CoreDNS       |                                         |
|   +---------------+                                         |
|          |                                                  |
|          | 2. Returns CNAME: "api.github.com"               |
|          v                                                  |
|   +---------------+                                         |
|   | App Pod       |                                         |
|   +---------------+                                         |
|          |                                                  |
+----------|--------------------------------------------------+
           |
           | 3. Direct outbound connection (bypasses kube-proxy)
           v
+-------------------------------------------------------------+
| External Internet / Cloud Service                           |
| (e.g. api.github.com or AWS RDS Postgres)                   |
+-------------------------------------------------------------+
```

---

## 3. Think of It Like This: The Speed-Dial Nickname
* You store your friend's phone number under the nickname **"Best Friend"** on your phone.
* When your friend changes their actual phone number from Airtel to Jio, you do not change your daily routine. You just update the number mapped to the nickname **"Best Friend"**.
* `ExternalName` is your cluster's speed-dial contact nickname for external services.

---

## 4. Where is ExternalName Used in Production?
* **Managed Cloud Databases (AWS RDS, GCP CloudSQL, MongoDB Atlas):** Running your stateless app containers inside Kubernetes while keeping stateful databases on managed cloud RDS instances outside the cluster.
* **Third-Party APIs and Gateways:** Aliasing services like Stripe, Twilio, SendGrid, or Salesforce so internal apps use standard internal naming conventions.
* **Gradual Cloud Migration:** When migrating a legacy monolith from on-premise VMs to Kubernetes, internal pods can communicate with the legacy VM using an `ExternalName` service until the monolith is containerized.

---

## 5. Code Manifest & Field-by-Field Breakdown

### File: `service.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-database-service
spec:
  type: ExternalName
  externalName: api.github.com
```

### Key Field Explanations:
* `spec.type: ExternalName`: Configures the service as a DNS CNAME redirect.
* `spec.externalName: api.github.com`: The target external domain name returned by CoreDNS.
* **Notice what is absent:** No `selector`, no `ports`, no `targetPort`. CoreDNS handles the resolution at the DNS Layer (Layer 7 DNS), not at the packet routing layer.

---

## 6. How to Run and Test

### Step 1: Apply the ExternalName Service
```bash
kubectl apply -f 04-externalname/service.yaml
```

Inspect the service:
```bash
kubectl get svc external-database-service
```

Expected Output:
```text
NAME                        TYPE           CLUSTER-IP   EXTERNAL-IP      PORT(S)   AGE
external-database-service   ExternalName   <none>       api.github.com   <none>    12s
```
Notice that `CLUSTER-IP` is `<none>` and `EXTERNAL-IP` is `api.github.com`.

### Step 2: Deploy the DNS Test Pod
```bash
kubectl apply -f 04-externalname/client-pod.yaml
```

Wait until running:
```bash
kubectl get pod dns-test-client
```

### Step 3: Verify DNS CNAME Resolution
Execute `nslookup` inside the test pod:
```bash
kubectl exec -it dns-test-client -- nslookup external-database-service
```

Expected Output:
```text
external-database-service.default.svc.cluster.local  canonical name = api.github.com
Name:      api.github.com
Address:   20.207.73.85
```

The `NXDOMAIN` lines that `nslookup` prints for `external-database-service.svc.cluster.local` and for the tailnet search domain are **expected noise**. The resolver walks the search list before it reaches `default.svc.cluster.local`, and `nslookup` exits with code `1` because of those failed lookups. The `canonical name` line is the real answer.

For a clean single-line proof, use `getent` instead:
```bash
kubectl exec -it dns-test-client -- getent hosts external-database-service
```

Expected Output:
```text
20.207.73.85      api.github.com  api.github.com external-database-service
```

Notice how CoreDNS returned `canonical name = api.github.com` and the IP of the external host.

> The `externalName` must point at a domain that actually resolves in public DNS. If it does not, `nslookup` still shows the CNAME, but the address lookup fails and every client gets `curl: (6) Could not resolve host`.

### Step 4: Test HTTP Request
The alias name differs from the certificate presented by the external server, so `-k` is required to skip certificate validation (the `Host` header keeps the routing correct):
```bash
kubectl exec -it dns-test-client -- curl -s -k -H "Host: api.github.com" https://external-database-service
```

Without `-k`, curl stops with `exit code 60` (SSL certificate problem) because the SNI name `external-database-service` does not match the `*.github.com` certificate.

Expected Output (GitHub API JSON):
```json
{
  "current_user_url": "https://api.github.com/user",
  "authorizations_url": "https://api.github.com/authorizations",
  ...
}
```

---

## 7. Important Caveats & Production Gotchas

* **No Port Remapping:** `ExternalName` operates at the DNS level only. It cannot remap ports (e.g. converting port `80` to `8080`).
* **TLS / HTTPS SNI Header Mismatch:** When calling HTTPS endpoints via an `ExternalName` alias, the SSL/TLS certificate of the external server will expect the real domain name (e.g. `api.github.com`), not `external-database-service`. Ensure your application sets the HTTP `Host` header or configure SSL certificate validation accordingly.
* **No IP Addresses Allowed in `externalName`:** The `externalName` field requires a valid DNS hostname (e.g. `db.example.com`), not a raw IP address (e.g. `192.168.1.50`). To route to a raw external IP, use a `ClusterIP` service without a selector and create a manual `Endpoints` object.

---

## 8. Cleanup
```bash
kubectl delete -f 04-externalname/client-pod.yaml
kubectl delete -f 04-externalname/service.yaml
```
