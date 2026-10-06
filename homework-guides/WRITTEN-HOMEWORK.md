# Published Written Homework

The written gaps use short technical explanations, comparison tables and small
diagrams. Existing screenshots are preserved. Each update is committed and
pushed to its corresponding session branch and directory.

| Session | Published work | Branch and file |
| --- | --- | --- |
| 01–02 | Ubuntu/Arch user-command distinction and Linux command meanings. | [session2-linux/README.md](https://github.com/vedanshun05/devops-heros/blob/session2-linux/session2-linux/README.md) |
| 08 | Overlay network purpose, use cases and communication across Docker hosts. | [Overlay notes](https://github.com/vedanshun05/devops-heros/blob/session8-docker-networking-volume/session8-docker-networking-volume/README.md#task-4-overlay-network) |
| 09 | Control plane, worker components and the path from a request to running Pods. | [Architecture notes](https://github.com/vedanshun05/devops-heros/blob/session9-k8s/session9-k8s/Readme.md#kubernetes-architecture) |
| 11 | All three requested object comparisons, linked from the session README. | [Object comparisons](https://github.com/vedanshun05/devops-heros/blob/session11-kubernetes-services/session-11-kubernetes-services/object-comparisons/README.md) |
| 16 | CI/CD concepts, project README, Dockerfile and active root workflow. | [CI/CD README](https://github.com/vedanshun05/devops-heros/blob/session16-github-actions/session-16-github-actions/session-16-github-actions/10-final-cicd-pipeline/README.md) |
| 17 | Pipeline explanation, security configuration, active root workflow and Flask debug setting. | [DevSecOps README](https://github.com/vedanshun05/devops-heros/blob/session17-devsecops/session-17-devsecops/demo/README.md), [security notes](https://github.com/vedanshun05/devops-heros/blob/session17-devsecops/session-17-devsecops/demo/SECURITY.md) |

Sessions 8 and 11 have no remaining lab task from the revised audit. The other
listed sessions still need their real execution evidence, as described in the
[command guide](./README.md). Session 21 is excluded.

## Local worktrees

The updated files remain under `homework-workspaces/sessionN`, on local
`homework-sessionN` branches. Use those directories when following the guide.
The original checkout and its existing untracked session folders are preserved.

Publishing the session 16–17 workflows triggers GitHub Actions. Their code and
configuration are published; successful execution and screenshots are separate
remaining tasks. The guide explains how to inspect the runs and handle failures.

The command guide is published at repository-root `homework-guides/README.md`
on the `main` branch.
