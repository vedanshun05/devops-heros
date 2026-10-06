# Security Checks

The active configuration is the repository-root
`.github/workflows/session17-devsecops.yml`.

| Check | Configuration | When it blocks the pipeline |
| --- | --- | --- |
| SAST | Bandit scans `app/`. | Medium/high severity findings at medium/high confidence. |
| SCA | pip-audit checks `requirements.txt`. | A known dependency vulnerability is reported. |
| Secret scan | Trivy filesystem scan of the demo directory. | A secret finding is reported. |
| Image scan | Trivy scans the built image. | A HIGH or CRITICAL vulnerability is reported. |

Scanner failures return a nonzero exit code. Jobs depend on the preceding job,
so a failed check stops image publication and deployment.

## Source-code setting

Flask debug mode is disabled. Bandit's B104 rule flags binding to `0.0.0.0`.
That bind is intentional inside the container: traffic from a Kubernetes Service
must reach the process. A `nosec B104` annotation applies only to that line.
It does not suppress other findings.

## Credentials

GitHub supplies `GITHUB_TOKEN` at runtime. It has package-write permission only
in the image-publishing job and package-read permission in the deployment job.
The Kubernetes pull Secret is created on the temporary runner cluster.
Credentials are not written into source files or manifests.

When a gate fails, examine the finding, fix the affected code or dependency,
and rerun the check. Successful security output still needs to be captured.
