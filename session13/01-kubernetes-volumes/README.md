# Kubernetes volumes

| Type | Lifetime and use | Existing lab |
| :-- | :-- | :-- |
| `emptyDir` | Shared scratch space for containers in one Pod. Survives container restarts; deleting the Pod deletes the volume. | [emptydir-pod.yaml](../01-volumes/emptydir-pod.yaml) |
| `hostPath` | Mounts a path on one node. Data is tied to that node; grants access to host files. | [hostpath-pod.yaml](../01-volumes/hostpath-pod.yaml) |
| PersistentVolume | Cluster storage resource with capacity, access modes and a reclaim policy. | [pv.yaml](../02-persistent-storage/pv.yaml) |
| PersistentVolumeClaim | Namespaced request for storage; Pods mount a bound claim. | [pvc.yaml](../02-persistent-storage/pvc.yaml) |
| StorageClass | Defines a provisioner and storage policy. | `kubectl get storageclass` |
| Dynamic provisioning | A compatible provisioner creates a PV for a new PVC automatically. | [dynamic PVC](../03-storageclass/pvc.yaml) |

`ReadWriteOnce` means writable from one node, which may contain multiple Pods. It does not mean one Pod. A `Retain` reclaim policy preserves storage after claim deletion; `Delete` asks the provisioner to remove it.

```bash
kubectl apply -f session13/01-volumes/emptydir-pod.yaml
kubectl apply -f session13/02-persistent-storage/
kubectl get pv,pvc,storageclass
kubectl describe pvc
kubectl apply -f session13/03-storageclass/pvc.yaml
```

The [mini-project](../mini-project/README.md) mounts a PVC for its web content and demonstrates data surviving replacement of a Pod. Its evidence is attached to the [submitted README](../README.md). Use local `hostPath` for teaching, and a CSI-backed provisioner for multi-node production storage.

Sources: [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/), [Persistent volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).
