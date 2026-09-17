# Pod — The Smallest Deployable Unit in Kubernetes

## 1. What is a Pod?

A **Pod** is the smallest, most basic deployable object in Kubernetes. It is a wrapper around **one or more containers** that share:

* The same **network namespace** (one shared IP address and port space).
* The same **storage volumes**.
* The same lifecycle (they are created, scheduled, and deleted together).

Most of the time a Pod holds exactly one container. Multi-container Pods (sidecars) are used for logging, proxying, or config reloading.

```text
+-----------------------------------------------------+
|                    Pod (10.244.0.15)                |
|  +-----------------------------------------------+  |
|  | Container: nginx-container                    |  |
|  | image: nginx:1.25-alpine                      |  |
|  | listens on containerPort 80                   |  |
|  +-----------------------------------------------+  |
+-----------------------------------------------------+
                        |
        scheduled onto a worker node by the scheduler,
        started and health-checked by kubelet
```

## 2. Pod Lifecycle (the phases you will see)

| Status | Meaning |
| :--- | :--- |
| `Pending` | Pod accepted by the API server but the container is not started yet (image pulling or waiting for scheduling). |
| `ContainerCreating` | Container image is being pulled and the sandbox is being built. |
| `Running` | At least one container is running. |
| `Succeeded` / `Completed` | All containers exited with code `0` (normal for Jobs). |
| `Failed` / `Error` | At least one container exited with a non-zero code. |
| `CrashLoopBackOff` | Container keeps exiting and Kubernetes backs off before restarting it. |
| `ImagePullBackOff` | Kubernetes cannot pull the image (wrong tag, wrong registry, no credentials). |
| `Terminating` | Pod is being deleted; it receives `SIGTERM` then `SIGKILL`. |

Official Pod **phases** are only `Pending`, `Running`, `Succeeded`, `Failed`, `Unknown`. Everything else you see in `kubectl get pods` comes from container states.

## 3. Anatomy of the YAML File

```yaml
apiVersion: v1          # API group/version for Pod objects (stable, v1)
kind: Pod               # object type
metadata:
  name: nginx-pod       # unique name inside the namespace
  labels:               # key/value tags used by Services and selectors
    app: nginx
    tier: frontend
spec:
  containers:
    - name: nginx-container
      image: nginx:1.25-alpine
      ports:
        - containerPort: 80   # the port the process listens on inside the container
      resources:
        requests:             # guaranteed resources (used by the scheduler)
          cpu: "50m"
          memory: "64Mi"
        limits:               # hard ceiling (container is throttled/killed above it)
          cpu: "200m"
          memory: "128Mi"
```

Rules to remember while writing YAML:

* Indentation is spaces only, never tabs. Two spaces per level is the convention.
* `apiVersion`, `kind`, `metadata.name` and `spec` are mandatory.
* In a Pod you must set `metadata.name`. Inside a Deployment the pod template uses `metadata.labels` instead (the name is generated).

## 4. Labels vs Selectors

* **Labels** are key/value pairs attached to objects (`app: nginx`, `tier: frontend`). They are just metadata.
* **Selectors** are queries over labels (`app=nginx`). Services, ReplicaSets and Deployments use selectors to find the Pods they own.

```text
Labels   : put ON the object        (app=nginx, tier=frontend)
Selector : query OVER the labels    (select all objects where app=nginx)
```

If the selector does not match the labels, the Service gets **no endpoints** — the single most common beginner mistake.

## 5. Step-by-Step Commands

### Step 1: Apply the Pod
```bash
kubectl apply -f 01-pod/nginx-pod.yaml
```

Expected output:
```text
pod/nginx-pod created
```

### Step 2: Check the Pod status
```bash
kubectl get pods
kubectl get pods -o wide
```

Expected output:
```text
NAME        READY   STATUS    RESTARTS   AGE    IP            NODE
nginx-pod   1/1     Running   0          25s    10.244.0.15   minikube
```

### Step 3: Inspect the Pod in detail
```bash
kubectl describe pod nginx-pod
```

Look for the `Node`, `IP`, `Containers`, `Events` and `Conditions` sections. The Events list is what you read first when a Pod is stuck.

### Step 4: Read the container logs
```bash
kubectl logs nginx-pod
```

Expected output (nginx access log lines appear after you curl it):
```text
/docker-entrypoint.sh: Configuration complete; ready for start up
```

### Step 5: Run a command inside the container
```bash
kubectl exec -it nginx-pod -- sh
```

Then inside the shell:
```bash
hostname -i
id
exit
```

### Step 6: Filter Pods using a label selector
```bash
kubectl get pods -l app=nginx
kubectl get pods -l tier=frontend
kubectl get pods --show-labels
```

Expected output:
```text
NAME        READY   STATUS    RESTARTS   AGE     LABELS
nginx-pod   1/1     Running   0          2m21s   app=nginx,tier=frontend
```

### Step 7: Access the container without a Service (port-forward)
```bash
kubectl port-forward pod/nginx-pod 8080:80
```

Open `http://localhost:8080` in the browser. You should see the default **Welcome to nginx!** page.
Press `Ctrl+C` to stop forwarding. Port-forward is for developer debugging only — it is not a production access method.

### Step 8: Prove that Pods are ephemeral
```bash
kubectl delete pod nginx-pod
kubectl get pods
kubectl apply -f 01-pod/nginx-pod.yaml
kubectl get pods -o wide
```

The recreated Pod gets a **new IP address**. That is exactly why a Service is required in front of it.

## 6. Cleanup
```bash
kubectl delete -f 01-pod/nginx-pod.yaml
```

## 7. Interview Notes
* Pod vs container: a Pod is the Kubernetes scheduling unit; it can hold multiple containers sharing a network namespace.
* Pods are **mortal** — never address them directly by IP; always put a Service in front.
* `containerPort` is documentation for humans; traffic still reaches the Pod even without declaring it.
* Resource `requests` decide where the Pod is scheduled, `limits` decide when it is throttled or OOM-killed.