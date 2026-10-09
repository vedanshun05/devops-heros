# Fully Qualified Domain Names

An FQDN identifies a DNS name completely. Kubernetes Services normally use `<service>.<namespace>.svc.<cluster-domain>`. This Minikube cluster uses `cluster.local`.

| Name | Use |
| :-- | :-- |
| `web-service-clusterip` | Same namespace, through the Pod's DNS search list |
| `web-service-clusterip.homework11` | Another namespace |
| `web-service-clusterip.homework11.svc.cluster.local` | Full Service name |

A normal Service resolves to its ClusterIP. A headless Service returns addresses of ready backing Pods. An ExternalName Service returns a CNAME. DNS identifies the address; clients must still use the Service's exposed port.

The actual lab resolved to `10.98.37.164`. HTTP succeeded with `:8080`; omitting it tried port 80 and timed out. This separates successful DNS resolution from an incorrect HTTP port.

[Actual DNS and HTTP screenshot](../README.md#dns-hands-on) · [Kubernetes DNS documentation](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
