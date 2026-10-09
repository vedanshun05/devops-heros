# Session 16: CI/CD Demo

This project is a Python calculator with five existing unit tests. The build
script copies the application into `build/`. The Dockerfile packages it as a
container that prints the result of adding 10 and 5.

## CI vs CD

**Continuous Integration (CI)** checks a code change by testing and building it.
**Continuous Delivery** keeps a tested build ready for release. **Continuous
Deployment** automatically releases it to a running environment. Here the CD
job automatically runs the built container as a Kubernetes Job.

## GitHub Actions terms

| Term | Meaning in this project |
| --- | --- |
| Pipeline | The complete sequence from a code push to deployment. |
| GitHub Actions | GitHub's service for running this sequence. |
| Workflow | The YAML file describing triggers, jobs and steps. |
| Job | A group of steps on one runner; this workflow has `ci` and `cd`. |
| Step | One operation, such as running tests or uploading an artifact. |
| Runner | The machine executing a job; here GitHub provides `ubuntu-latest`. |
| Secret | A protected value; `DEMO_SECRET` demonstrates access without printing it. |
| Artifact | A file saved by a workflow and available to download or another job. |
| Build | Produce the application files and Docker image. |
| Test | Check the calculator's behaviour using the existing pytest tests. |

## Actual workflow

The active file is [session16-ci-cd.yml](../../../.github/workflows/session16-ci-cd.yml)
at the repository root. A push to `session16-github-actions` triggers it.

```text
Push -> CI: secret check -> tests -> build -> Docker image -> artifacts
                                                     |
                       CD: download image -> Kind -> Kubernetes Job -> logs
```

CI saves `calculator-build` and `calculator-image`. The latter contains the
built image as a compressed archive. CD downloads this exact image and loads
it into a temporary Kind Kubernetes cluster. `needs: ci` means CD runs only
when CI succeeds.

A Kubernetes Job is suitable because this calculator runs once and exits.
The expected Job log is `Deployed calculator: 10 + 5 = 15`. The runner and its
cluster are temporary; this demonstration does not create a persistent server.

## Project files

| File | Purpose |
| --- | --- |
| `app/calculator.py` | Calculator source code. |
| `tests/` | Existing unit tests. |
| `requirements.txt` | Test dependencies. |
| `build.sh` | Prepare build files. |
| `Dockerfile` | Package the calculator. |
| Repository-root `.github/workflows/session16-ci-cd.yml` | CI and CD jobs. |

## Execution evidence

The [actual run passed CI and CD](https://github.com/vedanshun05/devops-heros/actions/runs/37599499801/attempts/2). See the [submitted session README](../README.md) for the real passing-test, artifact and Kubernetes Job screenshots.
