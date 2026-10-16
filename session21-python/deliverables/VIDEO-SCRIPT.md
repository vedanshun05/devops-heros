# LabBoard video script — under 2 minutes

Record in **your own voice**. Target **1 minute 50 seconds**, including screen switches, with a strict final duration **under 2:00**. Read only the quoted narration. The actions and preparation are instructions for you.

This guide includes setup, narration and cleanup. Prepare everything before starting the recording. The [PowerPoint](LabBoard-Session21.pptx) remains the separate, detailed explanation; you do not need to present all 14 slides in this video.

## Before recording

From the repository root, start the app:

```bash
git switch session21-python
cd session21-python
docker compose -p session21-homework up --build -d
curl --fail --retry 30 --retry-connrefused --retry-delay 2 http://localhost:3000/health
curl --fail http://localhost:8000/ready
docker compose -p session21-homework ps
```

Expected: `{"status":"UP"}`, `{"status":"READY"}` and three running services, with PostgreSQL healthy. Wait for these results before recording. The existing project name reuses your saved Compose database volume.

1. Open http://localhost:3000 and confirm task creation works.
2. Prepare the terminal in `session21-python/` with `docker compose -p session21-homework ps` ready to run.
3. Pre-open the [Session 21 repository](https://github.com/vedanshun05/devops-heros/tree/session21-python/session21-python), the [successful pipeline](https://github.com/vedanshun05/devops-heros/actions/runs/38303472047) and [the saved Kubernetes screenshot](../Outputs/kubernetes.png). Keep all five pipeline jobs visible.
4. Rehearse once with a stopwatch. Use a short task title, **Video demo**, and the default assignee and priority to reduce typing. Remove only your rehearsal task before the final take.

The Kubernetes screenshot and pipeline run are **recorded evidence**. The app actions and Docker output are shown live. Keep the full PPT for submission alongside the video.

If a GitHub page is unavailable, pre-open the saved [repository screenshot](../Outputs/github-repository.png) or [pipeline screenshot](../Outputs/github-pipeline.png) and introduce it as recorded evidence. Record at 1080p if available, enlarge terminal text and check your microphone. The saved Kubernetes screenshot is sufficient for this sequence; no cluster startup is needed.

## 0:00–0:10 — Introduce the app

**Show:** The already-loaded LabBoard application at http://localhost:3000.

**Say:**

> Hi, I'm Vedanshu Nishad. This is LabBoard, my DevOps lab tracker, built with React, FastAPI and PostgreSQL.

## 0:10–0:40 — Demonstrate the working application

**Do:** Click **New task**, enter **Video demo** and click **Create task**. Change its status to **In progress**, switch to **Board**, mark it **Done** using its status dropdown, then reload the page. Keep the saved task visible.

**Say while doing it:**

> I built it to keep coursework tasks and notes together. I'll create a task, move it to In progress, then mark it Done. The board reflects the same data. After refreshing, the saved task is still here.

## 0:40–0:50 — Show Docker Compose

**Do:** Switch to the prepared terminal and run:

```bash
docker compose -p session21-homework ps
```

**Look for:** Three services Up, with PostgreSQL healthy.

**Say:**

> Docker Compose runs the website, application service and database together. This output shows all three services running.

## 0:50–1:00 — Show the repository

**Show:** The pre-opened repository tab, with the Session 21 folders visible. Supporting PPT slide: **7**.

**Say:**

> The GitHub repository contains the application code, deployment configuration and documentation, with a history of changes.

## 1:00–1:20 — Show CI/CD

**Show:** The completed GitHub Actions run with the five successful jobs visible. Supporting PPT slide: **8**.

**Say:**

> This recorded pipeline passed all five jobs: test, security, images, deploy and GitOps. It checks the code, scans and publishes containers, then verifies deployment in a temporary Kubernetes cluster before updating Git.

## 1:20–1:35 — Show Kubernetes evidence

**Show:** `Outputs/kubernetes.png`, enlarged so the pod names and Running statuses can be read. Supporting PPT slide: **10**.

**Say:**

> This is recorded evidence from Minikube. Helm manages the deployment, and the screenshot shows running application and database pods with their Services.

## 1:35–1:50 — Close

**Show:** Return to the application with your saved task visible.

**Say:**

> The project also includes persistent storage, monitoring and GitOps recovery checks. Terraform infrastructure was created separately and cleaned up. The PowerPoint explains the design and trade-offs. Thank you.

## Check and submit

Play back the recording and confirm the voice and evidence are clear. Keep the exported file **under 2:00**, including any title or ending; aim for **1:50**. Trim silent pauses if needed. Save it as **LabBoard-Session21-Demo.mp4** and submit it with **LabBoard-Session21.pptx**.

After recording, remove only your **Video demo** task, then stop the app from `session21-python/`:

```bash
docker compose -p session21-homework stop
```

This keeps the database volume and saved tasks for another recording.
