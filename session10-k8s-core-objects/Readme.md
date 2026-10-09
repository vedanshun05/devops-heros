- <https://github.com/Nency-Ravaliya/Kubernetes>

- k8s core objects: <https://github.com/Nency-Ravaliya/Kubernetes/blob/main/core-objects.md>

![apply](./Outputs/kubectl_apply.png)
![logs and pods](./Outputs/kubectl_logs_and_get_pods.png)
![get pods](./Outputs/kubectl_get_pods.png)
![desc](./Outputs/kubectl_desc.png)
![image error](./Outputs/kubectl_image_error.png)
![readiness](./Outputs/kubectl_readiness.png)

# Deployment

![deploy](./Outputs/deployment_v1.png)

# Replicaset

![rs](./Outputs/replicaset.png)
![rs scale](./Outputs/rs_scale.png)
![rs scale down](./Outputs/rs_scale_down.png)
![rs delete](./Outputs/rs_delete.png)

# Blue Green

![bg](./Outputs/BlueGreen/blue-green.png)

# Canary

![canary](./Outputs/canary/canary.png)

# Recreate

![r-1](./Outputs/Recreate/recreate-1.png)
![r-2](./Outputs/Recreate/recreate-2.png)

# Broken

![br-1](./Outputs/Broken/broken-1.png)
![br-2](./Outputs/Broken/broken-2.png)

# Pod lifecycle: each YAML executed

Executed on 9 October 2026 in the isolated `homework10` namespace. I applied every manifest in [pod-lifecycle](pod-lifecycle/README.md), then ran `kubectl get pod <name> -o wide` and `kubectl describe pod <name>` for each. The screenshots contain real status, container-state and event output. Deliberate failure manifests were retained for repeatable drills.

## 01-running

The Nginx Pod reached Running and Ready.

![Actual 01-running status and describe details](Outputs/Lifecycle/01-running.png)

## 02-pending

The impossible resource request left the Pod Pending; describe reported FailedScheduling.

![Actual 02-pending status and describe details](Outputs/Lifecycle/02-pending.png)

## 03-succeeded

The one-shot task exited zero with restartPolicy Never, so the Pod reached Succeeded (displayed as Completed).

![Actual 03-succeeded status and describe details](Outputs/Lifecycle/03-succeeded.png)

## 04-failed

The one-shot task exited one and restartPolicy Never preserved the Failed phase.

![Actual 04-failed status and describe details](Outputs/Lifecycle/04-failed.png)

## 05-crashloopbackoff

The crashing container restarted repeatedly. CrashLoopBackOff is a container waiting reason, not a separate Pod phase.

![Actual 05-crashloopbackoff status and describe details](Outputs/Lifecycle/05-crashloopbackoff.png)

## 06-imagepullbackoff

The deliberately nonexistent image could not be pulled. Events show the registry failure and backoff.

![Actual 06-imagepullbackoff status and describe details](Outputs/Lifecycle/06-imagepullbackoff.png)

## 07-readiness

The readiness HTTP check succeeded and the Pod became eligible for Service traffic.

![Actual 07-readiness status and describe details](Outputs/Lifecycle/07-readiness.png)

## 08-liveness

Removing the health file made the liveness probe fail; the kubelet restarted the container.

![Actual 08-liveness status and describe details](Outputs/Lifecycle/08-liveness.png)

## 09-startup

The startup probe allowed the slow initialization before making the container ready.

![Actual 09-startup status and describe details](Outputs/Lifecycle/09-startup.png)

## 10-init-container

The setup init container completed before the Nginx application container started.

![Actual 10-init-container status and describe details](Outputs/Lifecycle/10-init-container.png)

## 11-multi-container

The Nginx application and sidecar ran together; both containers must be ready for 2/2 readiness.

![Actual 11-multi-container status and describe details](Outputs/Lifecycle/11-multi-container.png)

## 12-termination

The application is configured to trap SIGTERM, perform cleanup and exit during the 20-second grace period. The deletion observation below captures Terminating.

![Actual 12-termination status and describe details](Outputs/Lifecycle/12-termination.png)

# Rolling update: v1 to v2

I applied `01-rolling-update/deployment-v1.yaml`, waited for four ready replicas, then applied `deployment-v2.yaml`. `maxSurge: 1` permits a fifth Pod and `maxUnavailable: 0` waits for replacement readiness. The old ReplicaSet scaled to zero and the new one reached four replicas. The container page changed to `VERSION: v2`.

![Actual rolling-update ReplicaSets and v2 response](Outputs/rolling-update-v2.png)

![Pod observed in Terminating state during graceful deletion](Outputs/Lifecycle/termination-delete.png)
