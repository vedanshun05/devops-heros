# 01-clusterip

![01-1](./Outputs/01/01-1.png)
![01-2](./Outputs/01/01-2.png)
![01-3](./Outputs/01/01-3.png)

# 02-nodeport

![0201](./Outputs/02/02-1.png)
![02-2](./Outputs/02/02-2.png)
![02-3](./Outputs/02/02-3.png)

# 03-loadbalancer

![03-1](./Outputs/03/03-1.png)
![03-2](./Outputs/03/03-2.png)

# 04-externalname

![04-1](./Outputs/04/04-1.png)

# 05-headless

![05-1](./Outputs/05/05-1.png)

# Task 2: Kubernetes Object Comparison

[Deployment, ReplicaSet, DaemonSet, StatefulSet and Service comparisons](./object-comparisons/README.md)

# Task 3: FQDN

[FQDN, namespace DNS and Pod-to-Service communication](fqdn/README.md)

# Task 4: CoreDNS

[CoreDNS query resolution, configuration and troubleshooting](coredns/README.md)

## DNS hands-on

Executed on 9 October 2026 in the isolated `homework11` namespace. DNS returned the Service ClusterIP and HTTP on Service port 8080 returned the Nginx page. The screenshot includes the backing EndpointSlices and the live CoreDNS configuration.

![Actual DNS, HTTP and CoreDNS verification](Outputs/dns-verification.png)
