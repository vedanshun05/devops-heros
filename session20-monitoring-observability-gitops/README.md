# Session 20: Monitoring, Observability & GitOps

I used Prometheus and Grafana to monitor a local system, collected Nginx logs,
tested an HTTP failure alert, and used Argo CD to deploy an application from Git.
The practical results below were captured on 6 October 2026.

## Task completion

| Task | What I demonstrated | Evidence |
|---|---|---|
| Metrics | Prometheus queries and Grafana visualizations | Original Prometheus/Grafana screenshots and host metrics |
| Logs | Nginx access logs with request paths and HTTP status codes | Kubernetes logs screenshot |
| Alerts | An application-down alert fired, then cleared after recovery | Alert failure and recovery screenshots |
| CPU utilization | Linux host CPU usage, averaged across CPU cores | Host metrics screenshot |
| Memory utilization | Linux host memory usage calculated from available memory | Host metrics screenshot |
| Application health | HTTP `200`, successful probes, and running application pods | HTTP results and Nginx page |
| Observability | Three pillars, their purpose, tools, and Kubernetes observability | Task 2 notes below |
| GitOps | Git change, automatic deployment, and self-healing | Git revision and replica screenshots |

## Lab environment and architecture

The completed GitOps demo uses the **`kind-session20`** Kubernetes context.
Argo CD runs in `argocd`; the application runs in `session20`.
Minikube is another local cluster, but its resources are separate.

```text
MONITORING — Docker Compose

Linux host CPU/memory --> Node Exporter ----+
                                         |
Nginx demo <-- HTTP probe -- Blackbox -----+--> Prometheus --> Grafana
   |                                             |
   +--> access logs                              +--> alert rules

GITOPS — kind-session20

Edit YAML --> commit/push --> GitHub --> Argo CD --> Deployment + Service
                                           ^               |
                                           +-- compare ----+--> Nginx pods
```

The monitored Docker Nginx container and the Kubernetes GitOps application are
separate demos. Host CPU/memory measurements describe the Linux machine, not
individual Kubernetes pods. Prometheus does not collect container logs in this lab.

| Tool/service | Purpose | Access |
|---|---|---|
| Prometheus | Scrape metrics, run PromQL, evaluate alerts | `http://localhost:9090` |
| Grafana | Display collected metrics | `http://localhost:3000` |
| Node Exporter | Expose Linux host CPU and memory counters | Internal Docker service `node-exporter:9100` |
| Blackbox Exporter | Check the Nginx HTTP response | Internal Docker service `blackbox:9115` |
| Monitoring Nginx | Application used for the failure drill | `http://localhost:8081` |
| Argo CD | Reconcile Kubernetes with Git | `https://localhost:8080` after port-forwarding |
| GitOps Nginx | Application deployed by Argo CD | `http://localhost:8082` after port-forwarding |

## Task 1: Monitoring

Monitoring means checking system measurements and health so that problems can be
detected. A metric is a number measured over time. A log records an event. An alert
becomes active when a configured condition remains true.

### Start the monitoring stack

Run from the repository root:

```bash
cd session20-monitoring-observability-gitops/04-grafana
docker volume create session20-grafana-data
docker compose up -d
docker compose ps
docker compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

Open Grafana and select **Session 20 → Session 20 Monitoring**. The dashboard and
default `prometheus` data source are provisioned from files. Grafana connects to
`http://prometheus:9090` inside Docker. Saved user dashboards and login settings
are kept in the named volume.

The standalone `03-prometheus` lab also uses port 9090 and the same container
name, so run one Prometheus stack at a time.

### CPU and memory utilization

Node Exporter reads the host's `/proc` and `/sys` through read-only mounts. In this
demo, only its CPU and memory collectors are enabled. See the official
[Node Exporter guide](https://prometheus.io/docs/guides/node-exporter/).

Enter these queries in Prometheus or a Grafana panel:

```promql
# CPU usage percentage, averaged across all host CPU cores
100 * (1 - avg(rate(node_cpu_seconds_total{job="node",mode="idle"}[1m])))

# Memory usage percentage based on memory not available to applications
100 * (1 - node_memory_MemAvailable_bytes{job="node"}
  / node_memory_MemTotal_bytes{job="node"})
```

CPU usage is calculated from the rate of idle CPU time. Memory usage subtracts
available memory from total memory. `MemAvailable` accounts for memory that can
be reused, including reclaimable cache. At the captured moment, CPU usage was
approximately **10.30%** and memory usage was **75.99%**. These values change.

![Actual host CPU, memory, HTTP status, and request logs](Outputs/Monitoring/01-metrics-health.png)

[Captured command output](Outputs/Monitoring/01-metrics-health.txt)

### Application health and logs

The [Blackbox Exporter](https://github.com/prometheus/blackbox_exporter) sends an
HTTP request to `http://demo-app:80/`. The `http_2xx` module considers a successful
2xx response healthy.

```promql
probe_success{job="application-health"}
probe_http_status_code{job="application-health"}
```

The successful result was `probe_success = 1` and HTTP status `200`.
`up = 1` means Prometheus could scrape an exporter; it does not by itself mean the
application being probed is healthy.

```bash
curl -I http://localhost:8081/
docker logs --tail 10 session20-monitoring-app
```

An access log shows the request method, path, time, client, and response code.
The metrics capture includes successful requests. It also includes a `400` from
an HTTPS attempt to the HTTP-only Nginx port; this illustrates how logs explain
individual failed requests.

![All four scrape targets are up](Outputs/Monitoring/02-targets.png)

### Alert failure and recovery

The rule in [alert-rules.yml](04-grafana/alert-rules.yml) is:

```yaml
alert: DemoApplicationUnavailable
expr: probe_success{job="application-health"} == 0
for: 10s
```

Prometheus scrapes and evaluates rules every five seconds. The alert becomes
pending first, then firing when the failure persists for ten seconds. See
[Prometheus alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/).

From `04-grafana`, reproduce the drill:

```bash
docker compose stop demo-app
# Wait about 20 seconds, then open http://localhost:9090/alerts
curl -s http://localhost:9090/api/v1/alerts

docker compose start demo-app
# Allow the next scrape and rule evaluation to detect recovery.
curl -I http://localhost:8081/
curl -s http://localhost:9090/api/v1/alerts
```

The stopped app produced `probe_success = 0` and a firing
`DemoApplicationUnavailable` alert, while exporter `up` remained `1`.

![Real failure condition and firing alert](Outputs/Monitoring/03-alert-firing.png)

[Captured command output](Outputs/Monitoring/03-alert-firing.txt)

![Prometheus Alerts page during the failure](Outputs/Monitoring/04-alerts-page.png)

After starting the app, HTTP returned `200`, `probe_success` returned `1`, and the
active alerts list became empty. The app was left running after this drill.

![Application restored and alert resolved](Outputs/Monitoring/05-alert-resolved.png)

[Captured command output](Outputs/Monitoring/05-alert-resolved.txt)

CPU-above-80% and memory-above-85% rules are also configured with a one-minute
duration. The controlled drill demonstrates the HTTP alert. Email/Slack delivery
and Alertmanager are not configured; the firing alert is visible in Prometheus.

## Task 2: Observability

Observability means using system outputs to understand what is happening inside
the system. Monitoring can show that a service is slow; observability helps us
investigate where the delay comes from.

### The three pillars

| Pillar | Meaning | Example |
|---|---|---|
| Metrics | Numeric measurements over time | CPU usage, request count, latency |
| Logs | Records of events | An Nginx request returning HTTP `500` |
| Traces | The path of a request across services | A request passing through an API, payment service, and database |

A trace has a trace ID and contains spans. Each span represents an operation
with a start time and duration. Shared trace IDs help connect operations across
services. See [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/).

Observability is required because an application can fail even when its process
is running. Metrics show trends, logs give event details, and traces help locate
slow or failed operations across services. Together they reduce guesswork during
troubleshooting. This lab demonstrates metrics and logs; distributed tracing is
documented rather than deployed.

### Common tools

| Tool | Common purpose | Used in this lab? |
|---|---|---|
| Prometheus | Collect and query metrics | Yes |
| Grafana | Visualize measurements | Yes |
| Loki | Store and query logs | Discussed; logs were read with Docker/kubectl |
| Jaeger / Tempo | Store and inspect distributed traces | Discussed |
| OpenTelemetry | Instrument applications and collect/export telemetry | Discussed |
| Argo CD | Show deployment sync and health | Yes; this is deployment health, not a metrics backend |

### Kubernetes observability

In Kubernetes, I can inspect node/pod resource usage, container logs, events,
application responses, and probe results. Pods can be recreated, so collecting
logs centrally is useful for retaining history. Readiness probes control whether
a pod receives Service traffic; liveness probes can trigger container restarts.
These probes require explicit configuration; the original Nginx GitOps manifest
does not define them. See [Kubernetes observability](https://kubernetes.io/docs/concepts/cluster-administration/observability/).

Use the correct context and namespace:

```bash
kubectl config use-context kind-session20
kubectl get pods -n session20
kubectl logs -n session20 -l app=session20-gitops-app --tail=10 --prefix=true
kubectl get events -n session20 --sort-by=.lastTimestamp
kubectl describe deployment session20-gitops-app -n session20
```

`kubectl top pods` and `kubectl top nodes` require Metrics Server. They were not
used for the host measurements above. Kubernetes events help explain scheduling,
scaling, and startup changes; application logs explain requests.

In a separate terminal, expose the GitOps app and generate traffic:

```bash
kubectl --context kind-session20 port-forward -n session20 svc/session20-gitops-app 8082:80
# In another terminal:
curl -I http://localhost:8082/
```

![Real Kubernetes request logs, HTTP health, pods, and events](Outputs/Observability/01-kubernetes-logs-health.png)

[Captured command output](Outputs/Observability/01-kubernetes-logs-health.txt)

## Task 3: GitOps

GitOps means keeping the desired system configuration in Git and using a
controller to reconcile the running system with it. Git is the source of truth
because it records the configuration, changes, and review history.

Declarative YAML describes the result I want, such as `replicas: 3`. Argo CD
compares this desired state with Kubernetes and applies changes. With automatic
sync enabled, Git changes can deploy without a separate manual sync. With
`selfHeal: true`, live drift can also be corrected. These settings are separate;
see [Argo CD automated sync](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/).

### Application configuration

| Setting | Value |
|---|---|
| Repository | `https://github.com/vedanshun05/gitops-demo.git` |
| Revision | `main` |
| Source directory | `app` |
| Excluded bootstrap file | `argocd-application.yaml` |
| Argo CD Application | `session20-app` in `argocd` |
| Workload | `session20-gitops-app` in `session20` |
| Final replica count | 5 |

The bootstrap Application YAML is applied manually. It is excluded from the
source directory so that Argo CD does not overwrite its own repository settings.
The exclusion fixed an earlier issue where a committed bootstrap file still
pointed to another repository. See [directory exclusions](https://argo-cd.readthedocs.io/en/stable/user-guide/directory/#excluding-certain-files).

### Git change and reconciliation

The initial Deployment had five replicas. I changed the Git manifest to three,
committed and pushed it, then refreshed Argo CD's repository comparison. The
refresh only requests a comparison; automatic sync performed the deployment.
I did not apply the workload manifest manually for this demo.

```bash
# From the GitOps repository, after editing app/deployment.yaml:
git add app/deployment.yaml
git commit -m "Session20 demonstrate GitOps scale to 3 replicas"
git push origin main

kubectl annotate application session20-app -n argocd argocd.argoproj.io/refresh=hard --overwrite
kubectl get application session20-app -n argocd
kubectl get deployment,pods -n session20
```

The actual demonstration commit was `e89ebbb`. Argo CD reported that revision as
`Synced` and `Healthy`, and Kubernetes showed `3/3` ready replicas.

![Initial state with five replicas](Outputs/ArgoCD/06-before-change.png)

[Captured command output](Outputs/ArgoCD/06-before-change.txt)

![Git revision synchronized and three replicas running](Outputs/ArgoCD/07-git-change-synced.png)

[Captured command output](Outputs/ArgoCD/07-git-change-synced.txt)

### Continuous reconciliation and self-healing

For this failure drill only, I changed the live replica count to one:

```bash
kubectl scale deployment session20-gitops-app -n session20 --replicas=1
kubectl get deployment session20-gitops-app -n session20 -w
```

Git still requested three. Argo CD detected the drift and restored three replicas
without a new Git commit. This demonstrates continuous reconciliation.

![Live drift to one replica while Git requests three](Outputs/ArgoCD/08-drift-introduced.png)

[Captured command output](Outputs/ArgoCD/08-drift-introduced.txt)

![Argo CD restores three replicas at the same Git revision](Outputs/ArgoCD/09-self-healed.png)

[Captured command output](Outputs/ArgoCD/09-self-healed.txt)

I then committed the original five-replica setting back to Git (`b6d47f0`).
Argo CD synchronized it, leaving the app at five ready replicas.

![Final restored five-replica state](Outputs/ArgoCD/10-final-restored.png)

[Captured command output](Outputs/ArgoCD/10-final-restored.txt)

![Nginx page served by the Kubernetes application](Outputs/ArgoCD/11-nginx-web.png)

To access Argo CD, keep this running in another terminal:

```bash
kubectl --context kind-session20 port-forward -n argocd svc/argocd-server 8080:443
```

Open `https://localhost:8080`. The local self-signed certificate produces a browser
warning. Never include login passwords in public screenshots.

## Original output gallery

These screenshots record the earlier learning steps. Historical errors and
incorrect namespace checks are labelled here rather than treated as final proof.
The added evidence above completes the missing checks. New command-output PNGs
are rendered from actual captured stdout/stderr; their `.txt` files retain the
same output. Web screenshots capture the actual local pages.

### Prometheus

Starting the standalone Prometheus container:

![Prometheus container startup](Outputs/Prometheus/1.png)

Querying `up = 1` and a Prometheus engine metric:

![Original Prometheus query results](Outputs/Prometheus/2.png)

### Grafana

Starting the original Grafana/Prometheus stack:

![Grafana stack startup](Outputs/Grafana/1.png)

The saved dashboard list:

![Grafana dashboard list](Outputs/Grafana/2.png)

A time-series panel showing Prometheus target `up = 1`:

![Original Grafana time-series panel](Outputs/Grafana/3.png)

Gauge, stat, and bar views of that same metric. These are different visualizations
of target health, not separate CPU/memory measurements:

![Original Grafana visualizations](Outputs/Grafana/visualization.png)

### Argo CD

Creating the kind cluster and Argo CD namespace:

![Cluster and namespace creation](Outputs/ArgoCD/1.png)

Applying Argo CD manifests; the pods were still initializing at this point:

![Argo CD installation in progress](Outputs/ArgoCD/2.png)

CLI login and first Application setup. The initial password is redacted. This
historical screenshot still shows the old repository URL and an initial CLI
error before login; the corrected configuration is shown in the later evidence:

![Argo CD CLI login with password redacted](Outputs/ArgoCD/3.png)

A manual workload deployment into `argocd`. This was an earlier practice step;
the actual GitOps workload runs in `session20` and is deployed by Argo CD:

![Earlier manual Kubernetes practice](Outputs/ArgoCD/4.png)

The original push to my GitOps repository. The following pod listing checks
`argocd`, so this screenshot alone does not prove the intended replica change:

![Original Git push and namespace check](Outputs/ArgoCD/5.png)

Argo CD before an Application was registered:

![Argo CD empty application list](Outputs/ArgoCD/web.png)

The Application pointing to my repository, with `Synced` and `Healthy` status:

![Argo CD connected to my repository](Outputs/ArgoCD/web2.png)

## Files and further practice

| Folder | Content |
|---|---|
| [01-monitoring-vs-observability](01-monitoring-vs-observability/README.md) | Concept comparison |
| [02-metrics-logs-traces](02-metrics-logs-traces/README.md) | Three pillars and a simple logging lab |
| [03-prometheus](03-prometheus/README.md) | Standalone metrics practice |
| [04-grafana](04-grafana/README.md) | Completed Compose monitoring stack |
| [05-introduction-to-gitops](05-introduction-to-gitops/README.md) | GitOps concepts |
| [06-git-as-source-of-truth](06-git-as-source-of-truth/README.md) | Git history and desired state |
| [07-argocd](07-argocd/README.md) | Argo CD walkthrough |
| [08-mini-project](08-mini-project/README.md) | Additional mini-project practice instructions |
| [gitops-demo](gitops-demo/README.md) | Local checkout of the separate GitOps repository |

The `08-mini-project` folder contains separate practice instructions; the results
in this report belong to `session20-app`, not an unverified `session20-mini` app.

## Cleanup

Stop monitoring when finished:

```bash
cd session20-monitoring-observability-gitops/04-grafana
docker compose down
```

This preserves Grafana's named data volume. Prometheus history in this lab is not
persisted across container replacement. Stop port-forward terminals with `Ctrl+C`.
For GitOps teardown, follow the relevant lab's cleanup instructions; do not delete
another cluster or namespace just because it is present in your kubeconfig.
