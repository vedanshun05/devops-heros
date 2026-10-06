# Session 17: CI/CD and DevSecOps Demo

This is a Python Flask web application with eight existing unit tests. It has
health, status, greeting and calculator endpoints, plus a demo dashboard.

## What DevSecOps adds

CI/CD builds, tests and deploys the application. DevSecOps adds security checks
to that same pipeline so findings can stop a release before deployment.

The active workflow is [session17-devsecops.yml](../../.github/workflows/session17-devsecops.yml)
at the repository root. A push to `session17-devsecops` triggers it.

```text
Code -> application build -> unit tests -> SAST -> SCA -> secret scan
     -> Docker build -> image scan -> security gate -> GHCR push
     -> Kubernetes deployment -> HTTP verification
```

## Pipeline stages

| Stage | Tool | What it does |
| --- | --- | --- |
| Application build | Python `compileall` | Check and compile Python source into bytecode. |
| Unit tests | Existing pytest tests | Check the application's expected behaviour. |
| SAST | Bandit | Inspect application source code for security issues. |
| SCA | pip-audit | Check dependencies for known vulnerabilities. |
| Secret scan | Trivy filesystem scanner | Look for exposed credentials in the demo directory. |
| Docker build | Docker | Package the app and dependencies into an image. |
| Image scan | Trivy vulnerability scanner | Check image packages for known vulnerabilities. |
| Security gate | Nonzero scanner exit codes and `needs` | Stop later jobs when a required check fails. |
| Registry | GitHub Container Registry (GHCR) | Store the image after all required checks pass. |
| Deployment | Kind and kubectl | Run that published image on Kubernetes. |

**SAST** examines our code. **SCA** examines the libraries it depends on.
The image scan also checks packages included in the container image.
[Security configuration and the single documented exception](./SECURITY.md).

## Registry and Kubernetes

The image name is `ghcr.io/vedanshun05/session17-python:<commit-sha>`.
The commit SHA identifies which code version produced it. The workflow uses
GitHub's automatic `GITHUB_TOKEN` to push and pull the image.

Deployment uses the existing `k8s/deployment.yaml` and `k8s/service.yaml`.
The workflow replaces the starter image placeholder with the published image,
creates a registry pull Secret, and waits for `session17-python` to roll out.
It then checks `/health` and `/api/status` through the Service.

The Kind cluster runs on a GitHub-hosted runner and is temporary. It does not
require uploading the local Minikube kubeconfig or creating cloud infrastructure.

## Application endpoints

| Route | Purpose |
| --- | --- |
| `/` | Web dashboard. |
| `/health` | Health check. |
| `/api/status` | App status and runtime information. |
| `/api/greet/<name>` | Greeting. |
| `/api/add` and `/api/calculate` | Calculator operations. |
| `/api/pipeline/run` | Simulated pipeline for the dashboard. |

The dashboard's simulation is separate from the real GitHub Actions workflow.
Capture the actual Actions jobs to demonstrate the homework pipeline.

## Execution evidence

Code and configuration are prepared; a successful run is still pending.
After executing the manual guide, add the actual run URL and screenshots showing
unit tests, SAST, SCA, secret scanning, image scanning, registry push and Kubernetes
rollout with HTTP verification. Include the root cause and fix for any failed run.
