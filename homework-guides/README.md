# Commands and screenshots for the remaining DevOps homework

Scope: remaining **execution and screenshot tasks in sessions 01–02, 09–10 and 12–17**. Session 21 is excluded. The written tasks and configuration files are published on their respective session branches; see [published homework](./WRITTEN-HOMEWORK.md).

Run one numbered step at a time. Take the named screenshot before continuing. Commands use Bash on your current Arch/Omarchy machine. The local labs still need to be run and captured. Publishing the session 16–17 workflows starts GitHub Actions runs; inspect those actual runs as described below.

| Session | Remaining execution |
| --- | --- |
| 01–02 | Create a test user and practice Linux commands. |
| 09 | Complete the Kubernetes Basics tutorial and capture output. |
| 10 | Capture the rolling update. |
| 12 | Capture troubleshooting before and after the fix. |
| 13 | Run the mini-project and submit existing local screenshots. |
| 14 | Capture `kubectl explain` and `kubectl top`. |
| 15 | Run missing Helm commands and the mini-project. |
| 16 | Run tests/build and verify the prepared CI/CD pipeline. |
| 17 | Run tests/scanners and verify registry push and Kubernetes deployment. |

## 0. Setup, branches, and screenshot submission

### 0.1 Set these variables in every terminal you use

```bash
export REPO='/home/vedu/Work/Year 3 Term 1/DevOps/devops-heros'
export WORK="$REPO/homework-workspaces"
mkdir -p "$WORK"
```

### 0.2 Use the session worktrees

Sessions 2, 8, 9, 11, 16 and 17 already have updated worktrees under `$WORK`. Use those existing directories. The remaining session sections create a worktree on first use. Each uses a local `homework-sessionN` branch. Written changes have already been pushed; after taking screenshots, commit and push only your new execution evidence or fixes. Keep your current checkout and its untracked session folders in place.

Run each `git worktree add` **only once**. On subsequent visits, just `cd` to its directory. If its branch/path already exists, do not delete anything: use that existing worktree.

```bash
git -C "$REPO" fetch origin
git -C "$REPO" worktree list
```

### 0.3 Kubernetes setup for sessions 09–15

Use a dedicated Minikube profile to keep these exercises separate from your existing cluster. Docker must already be running and accessible without sudo.

```bash
docker info
minikube start -p homework-labs --driver=docker
kubectl config use-context homework-labs
minikube status -p homework-labs
kubectl get nodes
minikube addons enable metrics-server -p homework-labs
kubectl rollout status deployment/metrics-server -n kube-system --timeout=180s
kubectl top nodes
```

If `top` initially reports metrics unavailable, wait about one minute and retry. Every Kubernetes terminal must show `homework-labs` from:

```bash
kubectl config current-context
```

### 0.4 Save screenshots and add them to Markdown

Save captures to the session's suggested `Outputs/` path. The filenames in this guide are suggestions so you can track progress. Use your normal screenshot shortcut or tool. Include the command and its output in the image.

After saving a screenshot, add its real relative path to the session README, for example `![Test user](./Outputs/manual/test-user.png)`. Add a short observation about the result you actually saw. Use `Readme.md` where that is the existing filename. The command explanations are already written; you only need to add execution evidence.

### 0.5 Commit and push each finished session

From its worktree root, set the two values to the row below. Use explicit paths, not `git add .`, especially for sessions containing nested Git projects or generated files.

| Session | `SESSION_DIR` | `REMOTE_BRANCH` |
| --- | --- | --- |
| 01–02 | `session2-linux` | `session2-linux` |
| 09 | `session9-k8s` | `session9-k8s` |
| 10 | `session10-k8s-core-objects` | `session10-k8s-core-objects` |
| 12 | `session-12-ingress-configmaps-secrets` | `session12-ingress-configmaps-secrets` |
| 13 | `session13` | `session13-storage-hpa-probes` |
| 14 | `session-14-kubernetes-troubleshooting` | `session14-kubernetes-troubleshooting` |
| 15 | `session-15-helm` | `session15-helm` |
| 16 | `session-16-github-actions` | `session16-github-actions` |
| 17 | `session-17-devsecops` | `session17-devsecops` |

Example for session 10:

```bash
SESSION_DIR='session10-k8s-core-objects'
REMOTE_BRANCH='session10-k8s-core-objects'
git status --short
git add -- "$SESSION_DIR"
git diff --cached --stat
git diff --cached --check
git commit -m 'session10 add rolling update outputs'
git push origin "HEAD:$REMOTE_BRANCH"
```

Review staged content before committing. Sessions 16/17 have narrower staging commands below because they also add root workflows. If a push is rejected because someone updated the remote, fetch and review that change; do not force-push.

## 01–02. Linux: user creation and cheat-sheet practice

### 1. Open the session

```bash
cd "$WORK/session2/session2-linux"
mkdir -p Outputs/manual
cat /etc/os-release
command -v adduser useradd
```

### 2. Create one disposable test user

On **your Arch/Omarchy machine**, `adduser` is not installed. Use the available `useradd` command with an explicit home directory and shell. First check that this proposed test name is unused:

```bash
getent passwd devops_hw_test
```

No output means unused. If it exists already, use a different test name in all commands below.

```bash
sudo useradd -m -s /bin/bash devops_hw_test
getent passwd devops_hw_test
id devops_hw_test
ls -ld /home/devops_hw_test
sudo -u devops_hw_test bash -c 'whoami; pwd; echo "$HOME"'
```

**Screenshot:** `Outputs/manual/test-user.png`. Show the new user's entry, identity and home directory. A password is not required for this `sudo -u` demonstration.

If doing the homework on **Ubuntu instead**, replace the creation command with:

```bash
sudo adduser devops_hw_test
```

Complete its prompts, then run the same verification commands. The distinction and command purposes are already explained in this session's README; record which distribution you actually used.

### 3. Practice the provided cheat sheet

Open the PDFs already in this session and use their commands. This compact group gives you actual file, search, permission, process and disk output:

```bash
mkdir -p /tmp/devops-homework-linux
cd /tmp/devops-homework-linux
pwd
touch commands.txt
echo 'Hello DevOps' > commands.txt
cat commands.txt
cp commands.txt commands-copy.txt
mv commands-copy.txt renamed.txt
ls -la
chmod 640 commands.txt
ls -l commands.txt
grep -n DevOps commands.txt
find . -name '*.txt'
whoami
hostname
date
df -h
ps -u "$USER"
```

Take two or three readable screenshots instead of squeezing everything into one: `linux-files.png`, `linux-permissions-search.png`, `linux-system.png`. The README already explains these commands. Continue with any additional important commands in your supplied PDF; the list above does not reproduce the entire PDF.

### 4. Clean up the test account

This deletes **only the disposable account and its home** created in step 2:

```bash
sudo userdel -r devops_hw_test
getent passwd devops_hw_test
cd "$WORK/session2/session2-linux"
```

Add the screenshots and notes to this session's `README.md`, then use section 0.5.

## 09. Kubernetes Basics tutorial

### 1. Open the session and check the cluster

```bash
cd "$WORK/session9/session9-k8s"
mkdir -p Outputs/manual
kubectl config use-context homework-labs
minikube status -p homework-labs
kubectl cluster-info
kubectl get nodes -o wide
kubectl get pods -n kube-system
```

**Screenshot:** `Outputs/manual/cluster-architecture.png`.

### 2. Complete the six tutorial stages

Follow [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/) alongside these commands. The official tutorial's deployment uses its bootcamp image. Keep this lab in its own namespace.

```bash
kubectl create namespace homework9
kubectl create deployment kubernetes-bootcamp -n homework9 \
  --image=gcr.io/google-samples/kubernetes-bootcamp:v1
kubectl rollout status deployment/kubernetes-bootcamp -n homework9 --timeout=180s
kubectl get deployments,pods -n homework9 -o wide
```

**Screenshot:** `tutorial-deployment.png`. Expected: one Running Pod and a ready Deployment.

```bash
POD9=$(kubectl get pods -n homework9 -l app=kubernetes-bootcamp -o jsonpath='{.items[0].metadata.name}')
kubectl describe pod "$POD9" -n homework9
kubectl logs "$POD9" -n homework9
kubectl exec "$POD9" -n homework9 -- printenv HOSTNAME
```

**Screenshot:** `tutorial-explore.png` (split describe/logs into two images if needed).

```bash
kubectl expose deployment kubernetes-bootcamp -n homework9 --type=NodePort --port=8080
kubectl get svc -n homework9
```

In **terminal A**, keep this running:

```bash
kubectl port-forward -n homework9 svc/kubernetes-bootcamp 8099:8080
```

In **terminal B**:

```bash
curl --fail http://localhost:8099/
```

**Screenshot:** `tutorial-service.png`. Open `http://localhost:8099/` for a browser capture. Port-forward is a local way to access the Service; the Service itself remains NodePort.

```bash
kubectl scale deployment/kubernetes-bootcamp -n homework9 --replicas=4
kubectl rollout status deployment/kubernetes-bootcamp -n homework9 --timeout=180s
kubectl get deployment,pods -n homework9
```

**Screenshot:** `tutorial-scale.png`. Expected: four ready replicas.

In **terminal A**, stop port-forward with Ctrl+C and start a watch:

```bash
kubectl get pods -n homework9 -w
```

In **terminal B**, perform the tutorial update:

```bash
kubectl set image deployment/kubernetes-bootcamp -n homework9 \
  kubernetes-bootcamp=jocatalin/kubernetes-bootcamp:v2
kubectl rollout status deployment/kubernetes-bootcamp -n homework9 --timeout=180s
kubectl get deployment kubernetes-bootcamp -n homework9 \
  -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
kubectl get pods -n homework9
```

**Screenshot:** `tutorial-update.png`; capture the Pod watch too. If the tutorial image cannot be pulled, document the event and follow the current tutorial's available image rather than declaring success. Restart port-forward after the update to capture the v2 page.

The tutorial's update module also includes a failed update and rollback. Stop
port-forward first. In terminal B:

```bash
kubectl set image deployment/kubernetes-bootcamp -n homework9 \
  kubernetes-bootcamp=gcr.io/google-samples/kubernetes-bootcamp:v10
kubectl get pods -n homework9 -w
```

Wait until the new Pods show `ErrImagePull` or `ImagePullBackOff`, then stop the
watch with Ctrl+C:

```bash
kubectl describe pods -n homework9
kubectl rollout undo deployment/kubernetes-bootcamp -n homework9
kubectl rollout status deployment/kubernetes-bootcamp -n homework9 --timeout=180s
kubectl get deployment kubernetes-bootcamp -n homework9 \
  -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
kubectl get pods -n homework9
```

**Screenshots:** `tutorial-failed-update.png` before undo, and
`tutorial-rollback.png` afterward. Expected: nonexistent v10 cannot be pulled;
rollback restores ready v2 Pods. This deliberately invalid tag comes from the
[official update tutorial](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/).

### 3. Submit and clean up

Link the captures in `Readme.md`, add short observations for deploy/explore/expose/scale/update, and commit/push. Stop the watch/port-forward with Ctrl+C, then:

```bash
kubectl delete namespace homework9
```

## 10. Missing rolling-update screenshot

### 1. Deploy your existing v1 manifest

```bash
git -C "$REPO" worktree add -b homework-session10 "$WORK/session10" origin/session10-k8s-core-objects
cd "$WORK/session10/session10-k8s-core-objects"
mkdir -p Outputs/manual
kubectl config use-context homework-labs
kubectl create namespace homework10
kubectl apply -n homework10 -f 01-rolling-update/deployment-v1.yaml
kubectl apply -n homework10 -f 01-rolling-update/service.yaml
kubectl rollout status deployment/app-rolling -n homework10 --timeout=180s
kubectl get pods -n homework10 -l app=app-rolling --show-labels
```

**Screenshot:** `rolling-v1.png`. Expected: four ready v1 Pods.

### 2. Watch old and new Pods while updating

**Terminal A**:

```bash
kubectl get pods -n homework10 -l app=app-rolling --show-labels -w
```

**Terminal B**:

```bash
cd "$WORK/session10/session10-k8s-core-objects"
kubectl apply -n homework10 -f 01-rolling-update/deployment-v2.yaml
kubectl rollout status deployment/app-rolling -n homework10 --timeout=180s
kubectl get rs,pods -n homework10 -l app=app-rolling
kubectl get pods -n homework10 -l app=app-rolling --show-labels
```

**Screenshots:** `rolling-during.png` from the watch and `rolling-v2.png` from the final output. Capture the watch while v1 Pods terminate and v2 Pods start. The files already specify maxSurge=1 and maxUnavailable=0.

### 3. Check the updated page

Stop the watch with Ctrl+C. In terminal A:

```bash
kubectl port-forward -n homework10 svc/app-rolling-service 8010:80
```

In terminal B:

```bash
curl --fail http://localhost:8010/
```

Expected: `VERSION: v2`. Add the three/four captures and one observation to `Readme.md`. Stop port-forward and delete only this lab:

```bash
kubectl delete namespace homework10
```

## 12. Troubleshooting: capture the documented Secret newline issue

This supplies the missing before/after evidence for your existing
`troubleshooting/secret-base64-gotcha.md`. Use a **dummy password** and isolated
resources. No PostgreSQL deployment is necessary to prove the newline bug; the
check below compares the injected value against the intended password.

### 1. Create the faulty Secret and a consumer

```bash
git -C "$REPO" worktree add -b homework-session12 "$WORK/session12" origin/session12-ingress-configmaps-secrets
cd "$WORK/session12/session-12-ingress-configmaps-secrets"
mkdir -p Outputs/manual
kubectl config use-context homework-labs
kubectl create namespace homework12
BAD_VALUE=$(echo 'dummy-homework-password' | base64 -w0)
# Deliberately keep echo's newline to reproduce the documented bug.
printf '{"apiVersion":"v1","kind":"Secret","metadata":{"name":"yatri-newline-demo","namespace":"homework12"},"type":"Opaque","data":{"PASSWORD":"%s"}}\n' "$BAD_VALUE" | kubectl apply -f -
cat > /tmp/yatri-newline-pod.yaml <<'EOF'
# Consume the dummy Secret to demonstrate its trailing newline.
apiVersion: v1
kind: Pod
metadata:
  name: yatri-newline-consumer
  namespace: homework12
  labels:
    app: yatri-newline-consumer
spec:
  containers:
    - name: consumer
      image: busybox:1.36
      command: [sh, -c, 'sleep 3600']
      env:
        - name: PASSWORD
          valueFrom:
            secretKeyRef:
              name: yatri-newline-demo
              key: PASSWORD
      resources:
        requests:
          cpu: 10m
          memory: 16Mi
        limits:
          cpu: 50m
          memory: 32Mi
EOF
kubectl apply -f /tmp/yatri-newline-pod.yaml
kubectl wait -n homework12 --for=condition=Ready pod/yatri-newline-consumer --timeout=120s
```

### 2. Investigate and capture BEFORE

```bash
kubectl get pod,secret -n homework12
kubectl get secret yatri-newline-demo -n homework12 -o jsonpath='{.data.PASSWORD}' | base64 --decode | od -An -tx1
kubectl exec -n homework12 yatri-newline-consumer -- sh -c \
  'printf "%s" "$PASSWORD" | od -An -tx1; if [ "$PASSWORD" = "dummy-homework-password" ]; then echo MATCH; else echo MISMATCH; fi'
```

**Screenshot:** `secret-before.png`. Expected: final byte `0a`, and `MISMATCH`. This is the deliberate failure; keep the screenshot.

### 3. Fix and capture AFTER

```bash
GOOD_VALUE=$(echo -n 'dummy-homework-password' | base64 -w0)
printf '{"apiVersion":"v1","kind":"Secret","metadata":{"name":"yatri-newline-demo","namespace":"homework12"},"type":"Opaque","data":{"PASSWORD":"%s"}}\n' "$GOOD_VALUE" | kubectl apply -f -
kubectl delete pod yatri-newline-consumer -n homework12
kubectl apply -f /tmp/yatri-newline-pod.yaml
kubectl wait -n homework12 --for=condition=Ready pod/yatri-newline-consumer --timeout=120s
kubectl exec -n homework12 yatri-newline-consumer -- sh -c \
  'printf "%s" "$PASSWORD" | od -An -tx1; if [ "$PASSWORD" = "dummy-homework-password" ]; then echo MATCH; else echo MISMATCH; fi'
```

**Screenshot:** `secret-after.png`. Expected: no final `0a`, and `MATCH`. The Pod is recreated because a Secret used as an environment variable is read when the container starts.

Append the before/after image links and observation to the session README. Explain: `echo` added a newline; `echo -n` removed it; the recreated Pod received the corrected value. Then:

```bash
kubectl delete namespace homework12
```

## 13. Mini-project: storage, HPA and probes

### 1. Open the worktree and preserve your existing local screenshots

```bash
git -C "$REPO" worktree add -b homework-session13 "$WORK/session13" origin/session13-storage-hpa-probes
cd "$WORK/session13/session13"
mkdir -p Outputs/manual
cp -an "$REPO/session13/Outputs/." Outputs/
kubectl config use-context homework-labs
minikube addons enable metrics-server -p homework-labs
minikube addons enable default-storageclass -p homework-labs
minikube addons enable storage-provisioner -p homework-labs
kubectl get storageclass
kubectl top nodes
```

### 2. Apply the actual mini-project files in order

```bash
cd mini-project
kubectl apply -f namespace.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml
kubectl rollout status deployment/web-app -n production-webapp --timeout=180s
kubectl get pvc,deployment,pods,svc,hpa -n production-webapp
```

**Screenshot:** `mini-project-created.png`. Expected: Bound PVC, two ready web-app Pods, Service and HPA. CPU may briefly be unknown before metrics arrive.

### 3. Prove persistence across Pod replacement

```bash
POD13=$(kubectl get pods -n production-webapp -l app=web-app -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n production-webapp "$POD13" -- sh -c 'echo "Vedanshu: persistent data" > /data/student.txt'
kubectl exec -n production-webapp "$POD13" -- cat /data/student.txt
kubectl delete pod -n production-webapp "$POD13"
kubectl wait -n production-webapp --for=condition=Ready pod -l app=web-app --timeout=180s
kubectl get pods -n production-webapp
NEW_POD13=$(kubectl get pods -n production-webapp -l app=web-app -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n production-webapp "$NEW_POD13" -- cat /data/student.txt
```

**Screenshot:** `mini-project-persistence.png`. Expected: the saved line survives. On this single-node Minikube lab, the RWO claim can be mounted by Pods on that same node.

### 4. Verify Service and probes

**Terminal A**:

```bash
kubectl port-forward -n production-webapp svc/web-service 8013:80
```

**Terminal B**:

```bash
curl --fail http://localhost:8013/
kubectl get deployment web-app -n production-webapp \
  -o jsonpath='{.spec.template.spec.containers[0].startupProbe}{"\n"}{.spec.template.spec.containers[0].readinessProbe}{"\n"}{.spec.template.spec.containers[0].livenessProbe}{"\n"}'
kubectl get pods -n production-webapp
```

**Screenshot:** `mini-project-service-probes.png`. Expected: Nginx page, three configured probes, ready Pods.

### 5. Generate load and capture HPA output

The first load below sends requests to your Nginx app, as in the existing mini-project guide. In terminal B:

```bash
kubectl run load-generator -n production-webapp --image=busybox:1.36 --restart=Never \
  -- /bin/sh -c 'for i in 1 2 3 4 5 6 7 8 9 10; do while true; do wget -q -O- http://web-service >/dev/null; done & done; wait'
kubectl get hpa -n production-webapp -w
```

**Terminal C**:

```bash
kubectl top pods -n production-webapp
kubectl get pods -n production-webapp
kubectl describe hpa web-app-hpa -n production-webapp
```

Take `mini-project-load.png` and `mini-project-hpa.png` when CPU rises and replicas increase. HTTP requests to static Nginx may not produce enough CPU on every machine. If after a few minutes CPU stays below target, use this explicit CPU-load fallback in terminal C:

```bash
for pod in $(kubectl get pods -n production-webapp -l app=web-app -o jsonpath='{.items[*].metadata.name}'); do
  kubectl exec -n production-webapp "$pod" -- sh -c 'nohup sh -c "while :; do :; done" >/tmp/hw-cpu-load.log 2>&1 &'
done
kubectl top pods -n production-webapp
kubectl get hpa -n production-webapp -w
```

This is synthetic CPU load inside the application Pods. Say so in your README; do not describe it as HTTP-only load. The 50% CPU target is relative to each Pod's 100m request, and maxReplicas is five. [HPA walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)

### 6. Stop load and clean up

Stop each watch/port-forward with Ctrl+C. Delete the load Pod and restart application containers to stop any synthetic background CPU loops:

```bash
kubectl delete pod load-generator -n production-webapp --ignore-not-found=true
kubectl rollout restart deployment/web-app -n production-webapp
kubectl rollout status deployment/web-app -n production-webapp --timeout=180s
kubectl get hpa,pods -n production-webapp
```

If you want a scale-down capture, watch HPA for several minutes. Then:

```bash
kubectl delete -f hpa.yaml --ignore-not-found=true
kubectl delete -f service.yaml --ignore-not-found=true
kubectl delete -f deployment.yaml --ignore-not-found=true
kubectl delete -f pvc.yaml --ignore-not-found=true
kubectl delete -f namespace.yaml --ignore-not-found=true
cd ..
```

The cleanup deletes the lab's PVC and stored data. Link both your previous screenshots and new mini-project captures in `mini-project/README.md` using `../Outputs/...` paths. Then commit/push the execution evidence.

## 14. Missing kubectl explain and kubectl top outputs

Your issue and mini-project screenshots already count under the agreed rule. These commands cover the two listed commands not found in the submission.

### 1. Explain fields

```bash
git -C "$REPO" worktree add -b homework-session14 "$WORK/session14" origin/session14-kubernetes-troubleshooting
cd "$WORK/session14/session-14-kubernetes-troubleshooting"
mkdir -p Outputs/manual
kubectl config use-context homework-labs
kubectl explain pod
kubectl explain pod.spec.containers.resources
kubectl explain deployment.spec.strategy
```

**Screenshots:** `kubectl-explain-pod.png`, `kubectl-explain-resources-strategy.png`. Observation: explain describes API fields and their types; it does not show live resource state.

### 2. Demonstrate live metrics

```bash
kubectl create namespace homework14
kubectl create deployment metrics-demo -n homework14 --image=nginx:1.27-alpine
kubectl rollout status deployment/metrics-demo -n homework14 --timeout=180s
kubectl get pods -n homework14 -o wide
kubectl top nodes
kubectl top pods -n homework14
```

Wait one minute and repeat `top pods` if the new Pod does not have metrics yet.

**Screenshot:** `kubectl-top.png`. Expected: CPU and memory columns. Add explanation and images to `README.md` or `OUTPUT.md`, then:

```bash
kubectl delete namespace homework14
```

## 15. Missing Helm commands and mini-project evidence

### 1. Open the session and preserve local screenshots

```bash
git -C "$REPO" worktree add -b homework-session15 "$WORK/session15" origin/session15-helm
cd "$WORK/session15/session-15-helm"
mkdir -p Outputs/manual
cp -an "$REPO/session-15-helm/Outputs/." Outputs/
kubectl config use-context homework-labs
```

### 2. Install the existing Notes chart

```bash
helm lint mini-project/notes-chart
helm upgrade --install notes-hw mini-project/notes-chart \
  --namespace homework15 --create-namespace --wait --timeout 180s
helm list -n homework15
kubectl get deployment,pods,svc,configmap -n homework15
```

**Screenshot:** `notes-install.png`. Expected: release revision 1 on a fresh install, one ready Pod. If the release already exists, revision will be higher; don't invent a revision number in your notes.

### 3. Capture helm status, helm get and helm search

```bash
helm status notes-hw -n homework15
helm get values notes-hw -n homework15 --all
helm get manifest notes-hw -n homework15
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo bitnami/nginx
```

`helm get` is a command group: `get values` and `get manifest` are the meaningful invocations. Searching Bitnami does not require installing its chart. [Helm get reference](https://helm.sh/docs/helm/helm_get/)

**Screenshots:** `helm-status.png`, `helm-get-values.png`, `helm-get-manifest.png`, `helm-search.png`.

### 4. Verify the mini-project app

In **terminal A**:

```bash
kubectl port-forward -n homework15 svc/notes-hw-svc 8015:80
```

In **terminal B**:

```bash
curl --fail http://localhost:8015/
kubectl exec -n homework15 deployment/notes-hw-deploy -- printenv APP_NAME ENVIRONMENT
```

**Screenshot:** `notes-app.png`. The supplied Notes chart uses Nginx to represent the app; expect the Nginx page and `notes-app`/`development` environment values.

### 5. Upgrade, upgrade again, rollback

Stop port-forward before an upgrade; restart it afterward if you need a browser capture. In terminal B:

```bash
cd "$WORK/session15/session-15-helm"
helm upgrade notes-hw mini-project/notes-chart -n homework15 \
  -f mini-project/notes-chart/values-prod.yaml --wait --timeout 180s
kubectl get deployment,pods -n homework15
kubectl exec -n homework15 deployment/notes-hw-deploy -- printenv ENVIRONMENT
helm history notes-hw -n homework15
```

**Screenshot:** `notes-upgrade1.png`: three ready Pods and production environment.

```bash
helm upgrade notes-hw mini-project/notes-chart -n homework15 \
  -f mini-project/notes-chart/values-prod.yaml --set replicaCount=2 --wait --timeout 180s
kubectl get deployment,pods -n homework15
helm history notes-hw -n homework15
```

**Screenshot:** `notes-upgrade2.png`: two ready Pods.

Look at `helm history`: choose the revision for your first development installation. On a fresh run it is 1:

```bash
helm rollback notes-hw 1 -n homework15 --wait --timeout 180s
helm history notes-hw -n homework15
kubectl get deployment,pods -n homework15
kubectl exec -n homework15 deployment/notes-hw-deploy -- printenv ENVIRONMENT
```

**Screenshot:** `notes-rollback.png`: one ready Pod and development environment, plus rollback history. Replace 1 with the correct revision if reusing an existing release.

### 6. Submit and uninstall

Link old screenshots into the relevant notes and new captures in `mini-project/README.md` with `../Outputs/manual/...` image paths. Then:

```bash
helm uninstall notes-hw -n homework15
helm list -n homework15
kubectl delete namespace homework15
```

**Screenshot:** `notes-uninstall.png`. Commit/push using section 0.5.

## 16. Complete the CI/CD demo

The calculator app, tests and build script already exist. Its Dockerfile and
root workflow are now published. CI tests/builds the calculator and uploads
artifacts; CD deploys the resulting image as a Kubernetes Job on a disposable
Kind cluster in the GitHub runner. This is a real lab deployment, not a persistent
cloud deployment. The homework doesn't prescribe a cloud destination.

### 1. Open the session

```bash
cd "$WORK/session16"
APP16='session-16-github-actions/session-16-github-actions/10-final-cicd-pipeline'
mkdir -p "$APP16/Outputs/manual"
cat "$APP16/Dockerfile"
cat .github/workflows/session16-ci-cd.yml
```

The Dockerfile, README and workflow are already committed and pushed from this worktree. The workflow triggers on pushes to `session16-github-actions`.

### 2. Run the actual existing tests and Docker app locally

```bash
cd "$WORK/session16/$APP16"
python3 -m venv /tmp/devops-session16-venv
source /tmp/devops-session16-venv/bin/activate
python -m pip install -r requirements.txt
python -m pytest -v
bash build.sh
ls -la build
docker build -t session16-calculator:local .
docker run --rm session16-calculator:local
deactivate
```

**Screenshots:** `tests-build.png`, `docker-run.png`. Expected: five tests pass; container prints `Deployed calculator: 10 + 5 = 15`. This calculator is a CLI app, so no web-server requirement is added.

### 3. Configure the homework demo secret

```bash
gh auth status
gh secret set DEMO_SECRET --repo vedanshun05/devops-heros
```

When prompted, enter a harmless demo value such as `homework-secret-check`.
If `gh auth status` says you are not signed in, run `gh auth login` and complete
the browser flow first. The workflow only prints whether the secret is configured.
The first published run stopped at this secret check because `DEMO_SECRET` was
not configured. After setting it, use step 4 to rerun that workflow.

### 4. Select the published pipeline run

```bash
gh run list --repo vedanshun05/devops-heros --branch session16-github-actions --limit 5
read -r -p 'Session16 run ID: ' RUN16
gh run view "$RUN16" --repo vedanshun05/devops-heros --web
```

Choose the run whose workflow is **Session 16 CI and CD**. The publication push
triggers it. If its first run failed because `DEMO_SECRET` was missing, set the
secret in step 3. Once that run has finished, rerun it:

```bash
gh run rerun "$RUN16" --repo vedanshun05/devops-heros
```

Skip rerun if the existing run is successful and its output is available.

### 5. Watch the real pipeline and take screenshots

```bash
gh run watch "$RUN16" --repo vedanshun05/devops-heros --exit-status
gh run view "$RUN16" --repo vedanshun05/devops-heros --web
```

Capture these **real GitHub pages**, not expected-output text:

- `pipeline-success.png`: workflow summary with CI and CD green.
- `pipeline-tests.png`: Test step showing passing tests.
- `pipeline-artifacts.png`: summary showing calculator-build and calculator-image.
- `pipeline-deploy.png`: CD logs showing completed Job and calculator result.

Download artifacts if you want to inspect them:

```bash
gh run download "$RUN16" --repo vedanshun05/devops-heros --dir /tmp/session16-artifacts
ls -R /tmp/session16-artifacts
```

Add links and the run URL to the final-pipeline README. Commit only that README
and its Outputs directory, then push to the same session branch. No registry or
AWS setup is required for this session.

## 17. Complete the DevSecOps pipeline

The published workflow implements **application build/tests → SAST → SCA → secret scan → Docker build
→ image scan/security gate → GHCR push → Kubernetes deployment**. Each scanner
can stop the pipeline. The deployment runs on disposable Kind in the runner,
as your existing lab's deployment approach does. It pulls the published GHCR
image and verifies the application's HTTP endpoints.

### 1. Open the session

```bash
cd "$WORK/session17"
APP17='session-17-devsecops/demo'
mkdir -p "$APP17/Outputs/manual"
cat .github/workflows/session17-devsecops.yml
tail -n 5 "$APP17/app/app.py"
```

The README, SECURITY.md and workflow are committed and pushed. Flask debug mode is disabled,
and the intentional container bind is documented for the SAST gate. Use this
tracked `demo` app; your separate local nested `devsecops` folder is preserved.

### 2. Run tests, SAST and dependency audit locally

```bash
cd "$WORK/session17/$APP17"
python3 -m venv /tmp/devops-session17-venv
source /tmp/devops-session17-venv/bin/activate
python -m pip install -r requirements-dev.txt
python -m pip install bandit pip-audit
python -m compileall -q app
python -m pytest -v --cov=app
bandit -r app --severity-level medium --confidence-level medium
pip-audit -r requirements.txt
```

**Screenshots:** `unit-tests.png`, `sast.png`, `sca.png`. Expected: tests pass,
no medium/high SAST findings, no known dependency vulnerabilities. If a scanner
finds issues, preserve that failure capture and follow its reported fixed version
or code remedy. Dependency vulnerability results change over time.

For a dependency issue, review the audit first. In this disposable project
environment, this command writes fixed direct requirement versions where
pip-audit can determine a remediation:

```bash
pip-audit --fix -r requirements.txt
cat requirements.txt
python -m pip install -r requirements-dev.txt
python -m pytest -v --cov=app
pip-audit -r requirements.txt
```

Rerun tests after changing dependencies. If no fix is available, record the blocker
and investigate the affected package; don't change a scanner to always succeed.
The workflow's image gate checks HIGH/CRITICAL findings as well. [pip-audit](https://github.com/pypa/pip-audit), [Bandit](https://bandit.readthedocs.io/en/latest/)

### 3. Build and verify the app locally

```bash
docker build --pull -t session17-python:local .
docker run --rm -d --name session17-homework -p 8017:5001 session17-python:local
curl --fail --retry 20 --retry-connrefused --retry-delay 1 http://localhost:8017/health
curl --fail http://localhost:8017/api/status
docker ps --filter name=session17-homework
```

**Screenshot:** `docker-app.png`; optionally open `http://localhost:8017/` for
`app-browser.png`. Stop this named lab container afterward:

```bash
docker stop session17-homework
deactivate
```

### 4. Check the published security configuration

```bash
cd "$WORK/session17"
git log -1 --oneline
cat "$APP17/SECURITY.md"
```

The implementation is already pushed to `session17-devsecops`. You do not need
to create another implementation commit. Only commit again if a reported finding
requires a fix or you have collected screenshots.

No Docker Hub password is needed: the workflow publishes to your GHCR account
using GitHub's automatic token. If GitHub shows a package permission error, check
that Actions is allowed and the package grants this repository access. If a
same-name package already belongs to another repo, grant access or use a new
package name consistently in both image-name steps.

### 5. Watch scans, registry push and deployment

The publication push triggers **Session 17 DevSecOps**. Select that workflow's run from the list below:

```bash
gh run list --repo vedanshun05/devops-heros --branch session17-devsecops --limit 5
read -r -p 'Session17 run ID: ' RUN17
gh run watch "$RUN17" --repo vedanshun05/devops-heros --exit-status
gh run view "$RUN17" --repo vedanshun05/devops-heros --web
```

Take screenshots as the jobs complete:

- `pipeline-success.png`: green test, sast, sca, secrets, container and deploy jobs.
- `secret-scan.png`: Trivy secret-scan output.
- `image-scan.png`: image vulnerability results and security gate.
- `registry-push.png`: GHCR push output; optionally the GitHub Packages page.
- `kubernetes-deploy.png`: rollout, Pods, Service and HTTP response in deploy logs.

Get full logs if a gate fails:

```bash
gh run view "$RUN17" --repo vedanshun05/devops-heros --log-failed
```

Fix the reported finding, run the relevant local checks, commit the changed files
and push again. A base-image vulnerability may require a different patched image
tag or an upstream fix; a green pipeline cannot be guaranteed in advance.

The Trivy actions use the official documented scanner inputs and nonzero exit
codes. [Trivy action](https://github.com/aquasecurity/trivy-action),
[secret scanner](https://trivy.dev/docs/latest/scanner/secret/),
[GHCR publishing](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)

### 6. Add real outputs to the README and push

For sessions 16 and 17, after saving screenshots and adding their image links:

For session 16:

```bash
cd "$WORK/session16"
APP_DIR='session-16-github-actions/session-16-github-actions/10-final-cicd-pipeline'
git add -- "$APP_DIR/README.md" "$APP_DIR/Outputs"
git diff --cached --stat
git diff --cached --check
git commit -m 'add homework pipeline screenshots'
git push origin HEAD:session16-github-actions
```

For session 17:

```bash
cd "$WORK/session17"
APP_DIR='session-17-devsecops/demo'
git add -- "$APP_DIR/README.md" "$APP_DIR/Outputs"
git diff --cached --stat
git diff --cached --check
git commit -m 'add homework pipeline screenshots'
git push origin HEAD:session17-devsecops
```

Use `./Outputs/manual/<filename>.png` links inside the demo README. Include the
successful run URL and the brief root-cause/fix explanation if an initial run failed.

## Final checklist for the remaining work

- [ ] Linux: test-user output and cheat-sheet practice captured.
- [ ] Kubernetes basics: tutorial stages captured.
- [ ] Rolling update: old/new Pod transition captured.
- [ ] Secrets troubleshooting: before/after output and screenshots linked.
- [ ] Storage/HPA/probes: mini-project captures and existing local outputs submitted.
- [ ] Troubleshooting: explain/top outputs added.
- [ ] Helm: missing commands and mini-project captures; local outputs submitted.
- [ ] CI/CD: actual successful CI/CD run and screenshots.
- [ ] DevSecOps: scanners/gates, registry push and deployment verified with screenshots.

After finishing local Kubernetes labs, you can stop this dedicated profile:

```bash
minikube stop -p homework-labs
```

Session 21 remains outside this guide.
