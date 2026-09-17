# Service — A Stable Address in Front of Mortal Pods

## 1. Why Do We Need a Service?

Pod IP addresses are temporary. Every time a Pod is deleted, restarted, or rescheduled, it comes back with a **new IP**. If a client is hardcoded to `10.244.0.15:80`, the moment that Pod dies the client starts getting `Connection refused`.

A **Service** solves this by giving you:

* A permanent **ClusterIP** (virtual IP) that never changes.
* A permanent **DNS name** (`nginx-service.default.svc.cluster.local`).
* **Load balancing** across every healthy Pod that matches its selector.

```text
Client (Pod or browser)
        |
        | http://nginx-service:80
        v
+--------------------------------------------+
| Service: nginx-service                     |
| ClusterIP: 10.96.150.45                    |
| Load balances with kube-proxy (L4)         |
+--------------------------------------------+
        |                    |
        v                    v
  [nginx-pod 10.244.0.15]  [nginx-pod 10.244.0.16]
        ^                    ^
        |                    |
  selected because both Pods carry the label app=nginx
```

## 2. Labels and the Selector — the Critical Link

```yaml
# In the Pod                                   # In the Service
metadata:                                      spec:
  labels:                                        selector:
    app: nginx              <-- must match -->     app: nginx
```

* If they match, `kubectl get endpoints nginx-service` lists the Pod IPs.
* If they do not match, the endpoints are `<none>` and every request fails. This is the classic "selector mismatch" mistake.

```bash
kubectl get endpoints nginx-service
```

Expected output:
```text
NAME            ENDPOINTS                     AGE
nginx-service   10.244.0.15:80                40s
```

## 3. Port Mapping: port vs targetPort vs nodePort

| Field | Layer | Meaning | Example |
| :--- | :--- | :--- | :--- |
| `containerPort` | Pod | Port the application process listens on inside the container. | `80` |
| `targetPort` | Service | Port on the Pod that the Service forwards traffic to. Defaults to `port` if omitted. | `80` |
| `port` | Service | Port the Service itself exposes **inside** the cluster. | `80` |
| `nodePort` | Service | Port opened on **every node's IP** so traffic from outside can enter (range `30000-32767`). | `30080` |

```text
Browser -> http://$(minikube ip):30080   (nodePort, opened on the node)
                        |
                        v
              Service port 80 (ClusterIP)
                        |
                        v
              targetPort 80 -> Pod containerPort 80
```

## 4. Service Types (the short version)

* **ClusterIP** — default, internal only.
* **NodePort** — ClusterIP + a port on every node (used in this lab).
* **LoadBalancer** — NodePort + a cloud load balancer with a public IP.
* **ExternalName** — a DNS CNAME alias to an outside hostname, no proxying.
* **Headless (`clusterIP: None`)** — no virtual IP; DNS returns the individual Pod IPs.

## 5. Step-by-Step Commands

### Step 1: Make sure the Pod exists
```bash
kubectl apply -f 01-pod/nginx-pod.yaml
kubectl get pods -l app=nginx
```

### Step 2: Apply the Service
```bash
kubectl apply -f 02-service/nginx-service.yaml
```

Expected output:
```text
service/nginx-service created
```

### Step 3: Verify the Service and the port mapping
```bash
kubectl get svc nginx-service
kubectl describe svc nginx-service
```

Expected output:
```text
NAME            TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
nginx-service   NodePort   10.96.150.45    <none>        80:30080/TCP   10s
```

`80:30080/TCP` is read as `port:nodePort/protocol`.

### Step 4: Confirm the selector actually matched the Pod
```bash
kubectl get endpoints nginx-service
kubectl get pods -l app=nginx --show-labels
```

If the endpoints show `<none>`, the labels and the selector disagree. Fix the YAML, re-apply, and check again.

### Step 5: Access the application from the host machine
```bash
curl http://$(minikube ip):30080
# or let Minikube open it and print the URL
minikube service nginx-service --url
```

Expected output (trimmed):
```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
<h1>Welcome to nginx!</h1>
```

### Step 6: Access it by DNS name from inside the cluster
```bash
kubectl run curl-client --rm -it --image=curlimages/curl:8.5.0 --restart=Never -- \
  curl -s http://nginx-service.default.svc.cluster.local
```

This proves CoreDNS resolves the Service name to its ClusterIP.

### Step 7: Port-forward through the Service (debugging)
```bash
kubectl port-forward svc/nginx-service 8080:80
```

Open `http://localhost:8080`.

### Step 8: Watch load balancing
```bash
kubectl scale pod/nginx-pod --replicas=2 2>/dev/null || true
kubectl get endpoints nginx-service -w
```

A bare Pod cannot be scaled — that is the job of a ReplicaSet or Deployment, which is exactly the topic of Session 10.

## 6. Cleanup
```bash
kubectl delete -f 02-service/nginx-service.yaml
kubectl delete -f 01-pod/nginx-pod.yaml
```

## 7. Interview Notes
* A Service is a **Layer 4** construct — it cannot route by URL path or hostname. That requires Ingress (Session 12).
* `kubectl get endpoints` is always the fastest way to debug "the Service is not working".
* `NodePort` is limited to `30000-32767` and opens the port on every node, so clients must know a node IP.
* Without a selector or endpoints you get an empty Service and `503`-style failures from clients.