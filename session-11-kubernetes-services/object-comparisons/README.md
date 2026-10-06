# Kubernetes Object Comparisons

## Deployment vs ReplicaSet

A **ReplicaSet** maintains a desired number of Pods. A **Deployment** manages
ReplicaSets to add application updates and rollback.

| Topic | Deployment | ReplicaSet |
| --- | --- | --- |
| Purpose | Manage application versions and replicas. | Maintain the requested Pod count. |
| Pod management | Manages Pods through ReplicaSets. | Creates replacement Pods when needed. |
| Scaling | Changes replicas and coordinates its ReplicaSets. | Adjusts its own desired Pod count. |
| Rolling updates | Gradually replaces old Pods with new ones. | Has no built-in rollout strategy. |
| Relationship | Owns ReplicaSets. | Usually owned by a Deployment. |

For example, a three-replica web Deployment owns a ReplicaSet with three Pods.
Changing the Deployment's image creates a new ReplicaSet. During a rolling
update, the new ReplicaSet grows while the old one shrinks. Afterward, an old
ReplicaSet may remain with zero replicas for rollout history.

[Sources: Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/),
[ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/).

## Deployment vs DaemonSet vs StatefulSet

Choose a **Deployment** for replaceable application replicas, a **DaemonSet**
for an agent on each eligible node, and a **StatefulSet** for stable Pod identity.

| Topic | Deployment | DaemonSet | StatefulSet |
| --- | --- | --- | --- |
| Use case | Stateless applications. | Node-level services. | Applications needing stable identity or storage. |
| Pod creation | Creates the requested number of replicas. | Runs one Pod on each eligible node. | Creates named, numbered Pods such as `db-0` and `db-1`. |
| Scaling | Change replicas; HPA can automate this. | Pod count follows eligible nodes. | Change replicas while preserving ordinal identities. |
| Networking | Usually one Service for interchangeable replicas. | Often node-oriented; can also use a Service. | A headless Service supplies stable per-Pod DNS. |
| Storage | Can mount PVCs; replicas do not automatically get separate claims. | Often uses `hostPath` to access node data. | `volumeClaimTemplates` can create a separate PVC for each Pod. |
| Example | Web frontend or REST API. | Log collector or node exporter. | Database cluster. |

A PVC (PersistentVolumeClaim) is a request for storage. A StatefulSet maintains
identity and storage associations; the database still
needs its own replication and backup configuration.
[Sources: workload controllers](https://kubernetes.io/docs/concepts/workloads/controllers/),
[StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/).

## ReplicaSet vs Service

| Topic | ReplicaSet | Service |
| --- | --- | --- |
| Responsibility | Maintain the desired Pod count. | Provide access to application endpoints. |
| Uses labels for | Finding the Pods it manages. | Selecting backend Pods. |
| Replaces deleted Pods | Yes. | No. |
| Provides a stable address | No. | A normal ClusterIP Service provides a stable IP and DNS name. |

Pod IPs can change after replacement. A Service lets clients use the same address
while backend Pods change. For a normal selector-based Service, EndpointSlices
track matching Pods; ready endpoints receive traffic through Service networking.

```text
Pod management: Deployment -> ReplicaSet -> Pods
Traffic:        Client -> Service -> ready Pod endpoints
```

For example, three web Pods can sit behind one Service. If a Pod is deleted,
the ReplicaSet replaces it and the endpoints are updated. The Service selector
must match Pod labels; a wrong selector can leave running Pods unreachable
through the Service.
[Source: Kubernetes Service](https://kubernetes.io/docs/concepts/services-networking/service/).
