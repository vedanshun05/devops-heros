# Session 20: Monitoring, Observability & GitOps

## Task 1: Monitoring

Monitoring means checking system performance and health. I used Prometheus for
metrics and Grafana for dashboards.

| Topic | Meaning | What I did |
|---|---|---|
| Metrics | Numbers measured over time | Queried metrics in Prometheus and viewed them in Grafana |
| Logs | Records of application events | Checked Nginx request logs using Docker and kubectl |
| Alerts | Signals raised when a condition is met | Stopped Nginx, observed an alert, and restarted it to clear the alert |
| CPU utilization | How much CPU is being used | Measured Linux host CPU usage using Node Exporter |
| Memory utilization | How much memory is being used | Measured Linux host memory usage using Node Exporter |
| Application health | Whether the application responds correctly | Verified HTTP `200` and `probe_success = 1` |

Node Exporter measured host CPU (**10.30%**) and memory (**75.99%**) in the capture.
Blackbox Exporter checked HTTP health. `up` checks scraping; `probe_success` checks HTTP.

### Commands

Run inside `04-grafana`:

```bash
docker volume create session20-grafana-data
docker compose up -d
curl -I http://localhost:8081/
docker logs --tail 10 session20-monitoring-app
```

Prometheus: `localhost:9090`. Grafana: `localhost:3000`.
The application-down alert was tested in Prometheus; email was not configured.

## Task 2: Observability

Observability helps us understand why a system is slow or failing.
It uses metrics, logs, and traces to investigate problems.

| Pillar | Meaning | Example |
|---|---|---|
| Metrics | Measurements over time | CPU usage and request count |
| Logs | Details about events | A request returned HTTP `500` |
| Traces | A request's path through services | API → payment service → database |

Common tools: **Prometheus** (metrics), **Grafana** (dashboards), **Loki** (logs),
**Jaeger/Tempo** (traces), and **OpenTelemetry** (telemetry collection).

Kubernetes observability includes pod/node metrics, container logs, events,
health probes, and application traces. I checked logs, events, and HTTP health.
Traces are documented as a learning topic.

## Task 3: GitOps

GitOps means managing deployments using configuration stored in Git.

- **Git as the source of truth:** Git stores the desired configuration and its history.
- **Declarative configuration:** YAML describes what we want, such as three replicas.
- **Continuous reconciliation:** Argo CD compares Kubernetes with Git and corrects differences.
- **Kubernetes + GitOps:** Argo CD deploys the manifests from Git into the cluster.

```text
Edit YAML → Commit → Push → GitHub → Argo CD → Kubernetes
```

Repository: [vedanshun05/gitops-demo](https://github.com/vedanshun05/gitops-demo).
Cluster: `kind-session20`. Argo CD namespace: `argocd`. App namespace: `session20`.

Git change: **5 → 3 replicas**, automatically synchronized.
Self-healing: a manual change to **1** was restored to **3**.
Final state: **5 replicas**, **Synced**, and **Healthy**.

```bash
kubectl --context kind-session20 get application session20-app -n argocd
kubectl --context kind-session20 get deployment session20-gitops-app -n session20
```

## Outputs

All 25 screenshots are below. New command-output images have matching `.txt` transcripts.

### Prometheus

### Setup and queries

![Prometheus startup](Outputs/Prometheus/1.png)
![Prometheus queries](Outputs/Prometheus/2.png)


### Grafana

### Setup and visualizations

These original panels show the Prometheus `up` metric.

![Grafana startup](Outputs/Grafana/1.png)
![Dashboard list](Outputs/Grafana/2.png)
![Time-series panel](Outputs/Grafana/3.png)
![Gauge, stat, and bar panels](Outputs/Grafana/visualization.png)


### Monitoring: CPU, memory, health, and alerts

### Host measurements and healthy targets

![CPU, memory, HTTP status, and logs](Outputs/Monitoring/01-metrics-health.png)
![Healthy scrape targets](Outputs/Monitoring/02-targets.png)

### Alert firing and recovery

![Application stopped and alert firing](Outputs/Monitoring/03-alert-firing.png)
![Prometheus firing alert](Outputs/Monitoring/04-alerts-page.png)
![Application restored and alert cleared](Outputs/Monitoring/05-alert-resolved.png)


### Kubernetes logs and application health

![HTTP response, request logs, pods, and events](Outputs/Observability/01-kubernetes-logs-health.png)


### Argo CD: setup and GitOps demo

### Initial setup

Earlier practice outputs; the old URL and namespace were corrected later. Password redacted.

![Cluster creation](Outputs/ArgoCD/1.png)
![Argo CD installation](Outputs/ArgoCD/2.png)
![CLI login with password redacted](Outputs/ArgoCD/3.png)
![Earlier manual deployment practice](Outputs/ArgoCD/4.png)
![Original Git push; pod check used argocd namespace](Outputs/ArgoCD/5.png)
![Before registering the application](Outputs/ArgoCD/web.png)
![Application connected to my repository](Outputs/ArgoCD/web2.png)

### Git change and self-healing

![Initial five replicas](Outputs/ArgoCD/06-before-change.png)
![Git change synchronized to three replicas](Outputs/ArgoCD/07-git-change-synced.png)
![Manual drift to one replica](Outputs/ArgoCD/08-drift-introduced.png)
![Argo CD restored three replicas](Outputs/ArgoCD/09-self-healed.png)
![Final five replicas, Synced and Healthy](Outputs/ArgoCD/10-final-restored.png)
![Application web page](Outputs/ArgoCD/11-nginx-web.png)


## Completion

| Deliverable | Status |
|---|---|
| Monitoring demo: metrics, logs, alerts, CPU, memory, and health | Complete |
| Observability documentation: pillars, purpose, tools, and Kubernetes | Complete |
| GitOps demo: Git change, automatic sync, and reconciliation | Complete |
| Screenshots and README | Complete |

The listed task is complete. Tracing is documented; a live tracing demo was not required.
