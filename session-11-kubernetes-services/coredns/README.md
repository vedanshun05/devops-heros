# CoreDNS

CoreDNS provides cluster DNS. Pods send queries to the `kube-dns` Service; the `kubernetes` plugin answers Service queries using API information. The `forward` plugin sends other names to upstream DNS. The live Corefile also contains health, readiness and cache plugins.

```bash
kubectl exec -n homework11 curl-client -- cat /etc/resolv.conf
kubectl exec -n homework11 curl-client -- nslookup web-service-clusterip.homework11.svc.cluster.local
kubectl get pods,svc -n kube-system -l k8s-app=kube-dns
kubectl get configmap coredns -n kube-system -o yaml
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30
kubectl get endpointslice -n homework11 -l kubernetes.io/service-name=web-service-clusterip
```

For failures, check the Pod resolver, namespace/name, DNS Pods and Service, then EndpointSlices. An HTTP failure with working `nslookup` may instead be a port, selector, readiness or NetworkPolicy problem. Check UDP and TCP 53 access when policies restrict traffic.

[Actual lab evidence](../README.md#dns-hands-on) · [Kubernetes DNS troubleshooting](https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/)
