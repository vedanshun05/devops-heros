# 04 - Grafana

Prometheus stores and queries metrics.

Grafana helps us **see** them.

Think:

```text
Prometheus = Data
Grafana    = Beautiful dashboard
```

---

# Architecture

```text
Application
     |
     v
 Prometheus
     |
     v
  Metrics
     |
     v
  Grafana
     |
     v
 Dashboard
```

---

# Start

```bash
docker volume create session20-grafana-data
docker compose up -d
```

Check:

```bash
docker compose ps
```

Expected shape:

```text
session20-prometheus    running
session20-grafana       running
```

Open:

```text
Prometheus:
http://localhost:9090

Grafana:
http://localhost:3000
```

---

# Grafana Login

For this classroom demo:

```text
Username: admin
Password: admin
```

Grafana may ask you to change the password after login.

Do not use these default credentials in production.

---

# Add Prometheus Data Source

The Compose stack now configures the default `prometheus` data source automatically
from `provisioning/datasources/prometheus.yml`. Select that source when creating a
panel. The steps below explain the equivalent manual setup.

Inside Grafana:

```text
Connections
   |
Data sources
   |
Add data source
   |
Prometheus
```

Use this URL:

```text
http://prometheus:9090
```

Important:

The Grafana container talks to the Prometheus container using the Docker Compose service name.

Do not use `http://localhost:9090` here. Inside the Grafana container,
`localhost` refers to Grafana itself, so that address produces connection errors.
The browser still opens Grafana at `http://localhost:3000`.

Then click:

```text
Save & test
```

Expected:

```text
Successfully queried the Prometheus API.
```

The exact UI wording can vary by Grafana version.

---

# Create a Simple Dashboard

Create:

```text
Dashboard
   |
Add visualization
```

Select the Prometheus data source.

Query:

```text
up
```

Choose a visualization such as:

```text
Stat
```

You should see:

```text
1
```

Meaning the Prometheus target is up.

The original screenshots scrape Prometheus itself. The stack now also includes
Node Exporter for Linux host CPU/memory, Blackbox Exporter for HTTP application
health, and a separate Nginx demo at `http://localhost:8081`. Open the provisioned
**Session 20 → Session 20 Monitoring** dashboard for these measurements. See the
[session report](../README.md) for queries, alert failure/recovery steps, and evidence.
Use `up` for the basic lab, or
`rate(process_cpu_seconds_total{job="prometheus"}[1m])` and
`process_resident_memory_bytes{job="prometheus"}` for the Prometheus process.
Those process metrics are not whole-machine utilization.

Grafana stores saved dashboards, data sources, and login settings in the
`session20-grafana-data` Docker volume. `docker compose down` preserves it.
Save your dashboard in the UI; an unsaved panel is not stored in that volume.

Grafana 12.1.1 can log `plugin table is already registered` during startup.
This was also reproduced with the official 12.1.10 image in an isolated check.
In this lab, Grafana still starts and the Prometheus panel works. Treat this
separately from data source connection errors; do not disable error logging.
An upstream report is available in
[Grafana issue #110015](https://github.com/grafana/grafana/issues/110015).

---

# Why Grafana?

Imagine having:

```text
CPU
Memory
Requests
Errors
Latency
```

A dashboard can put everything together:

```text
+----------------+----------------+
| CPU            | Memory         |
| 72%            | 61%            |
+----------------+----------------+
| Requests/sec   | Error Rate     |
| 150            | 1.2%           |
+----------------+----------------+
| Latency                         |
| 230 ms                          |
+---------------------------------+
```

Humans understand pictures faster than raw numbers.

---

# Stop

```bash
docker compose down
```

---

# Key Point

Remember:

```text
Prometheus -> collects/stores metrics
Grafana    -> visualizes metrics
```
