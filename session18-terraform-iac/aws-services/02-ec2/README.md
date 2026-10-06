# EC2 — Compute

## What is EC2?

EC2 stands for **Elastic Compute Cloud**. It provides virtual servers in AWS. Each virtual server is called an **instance**.

We can choose an operating system, CPU, memory, and storage, then run our applications on it. AWS manages the physical hardware; we manage the operating system and applications.

**Example:** Launch an Ubuntu instance and install Nginx to host a website.

## AMI

An **AMI (Amazon Machine Image)** is a template used to create an EC2 instance. It contains the operating system and can include installed software.

**Example:** An Ubuntu AMI creates an instance with Ubuntu installed. A custom AMI can also include our application.

The AMI must match the instance's processor architecture, such as x86 or ARM. AMIs are specific to an AWS Region.

## Instance types

An instance type defines the instance's CPU, memory, networking, and storage capabilities.

| Type | Main purpose |
| :-- | :-- |
| General purpose | Balanced resources for common applications |
| Compute optimized | More CPU power for processing tasks |
| Memory optimized | More RAM for databases and caches |
| Storage optimized | High local-storage performance |
| Accelerated computing | GPUs and other accelerators for specialized tasks |

**Example:** In `t3.micro`, `t3` identifies the instance family and generation, and `micro` identifies its size. Choose a type based on the application's requirements.

## Key pairs

A key pair contains a **public key** and a **private key**. For Linux SSH access, the instance stores the public key and we use the private key to connect.

Keep the private key safe and never upload it to Git. Network rules must also allow the connection.

## Security Groups

A Security Group acts as a virtual firewall for an instance's network interfaces. It controls incoming and outgoing traffic using allow rules.

**Example:** Allow TCP port `443` for HTTPS traffic. Allow SSH on port `22` only from an administrator's IP address.

Security Groups are **stateful**: when a connection is allowed, its reply traffic is automatically allowed. They do not support explicit deny rules.

## EBS

**EBS (Elastic Block Store)** provides storage volumes that work like disks attached to EC2 instances.

EBS stores operating-system files, applications, and data. Its data remains when the instance is stopped. When the instance is terminated, a volume may be deleted depending on its deletion setting.

- A volume and its instance must be in the same **Availability Zone**, an isolated location within a Region.
- A **snapshot** is a backup of a volume.
- Encryption protects stored data.

EBS storage can still cost money while an instance is stopped.

## Public vs private IP

| IP address | Purpose |
| :-- | :-- |
| Public IP | Communication over the internet |
| Private IP | Communication within the VPC and connected private networks |

A public IP also needs an Internet Gateway route and suitable firewall rules for internet access.

An automatically assigned public IPv4 address usually changes after stop/start. The primary private IPv4 address remains. An **Elastic IP** is a separately allocated public IPv4 address that we keep until we release it.

## Instance lifecycle

```text
Launch -> Pending -> Running -> Stopping -> Stopped
                       ^                      |
                       +------- Start --------+

Running or Stopped -> Shutting-down -> Terminated
```

| State or action | Meaning |
| :-- | :-- |
| Pending | The instance is starting |
| Running | The instance can run applications |
| Stopped | The instance is turned off and can be started again |
| Reboot | Restart the operating system |
| Hibernate | Save RAM to EBS and stop, when supported |
| Terminated | Permanently delete the instance; it cannot be restarted |

Stopping and starting is supported for EBS-backed instances. Stopping is useful when we want to use the instance again; termination removes it permanently.

## Common use cases

- Hosting websites and APIs.
- Running development environments.
- Running build jobs and batch processing.
- Running applications that need control over the operating system.

## References

- [AWS: What is EC2?](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html)
- [AWS: AMIs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)
- [AWS: Instance types](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html)
- [AWS: Key pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)
- [AWS: Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)
- [AWS: EBS](https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html)
- [AWS: IP addresses](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-instance-addressing.html)
- [AWS: Instance lifecycle](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html)
