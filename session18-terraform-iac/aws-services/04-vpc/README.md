# VPC — Networking

## What is VPC?

VPC stands for **Virtual Private Cloud**. It is our own logically isolated network inside AWS.

We choose its IP address range and control how resources communicate with each other and the internet.

A VPC belongs to one AWS Region. It can contain subnets in different **Availability Zones**, which are isolated locations within that Region.

## CIDR

**CIDR (Classless Inter-Domain Routing)** is a way to write an IP address range.

**Example:** `10.0.0.0/16` can be the address range of a VPC. The `/16` means the first 16 bits identify the network. A larger number after `/` gives a smaller address range.

| Range | Example purpose |
| :-- | :-- |
| `10.0.0.0/16` | Entire VPC |
| `10.0.1.0/24` | One subnet |
| `10.0.2.0/24` | Another subnet |

Subnet ranges must be inside the VPC range and must not overlap.

## Subnets

A subnet is a smaller section of a VPC's IP address range. Each subnet belongs to one Availability Zone.

**Example:** Put a public web server in one subnet and a private database in another subnet.

A subnet's route table determines whether it is public or private.

## Route tables

A route table contains rules that tell network traffic where to go. Each rule has a **destination** and a **target**.

| Destination | Target | Meaning |
| :-- | :-- | :-- |
| `10.0.0.0/16` | `local` | Send traffic within the VPC |
| `0.0.0.0/0` | Internet Gateway | Send other IPv4 traffic toward the internet |

`0.0.0.0/0` represents all IPv4 addresses. A more specific matching route is used first.

Every subnet uses a route table. A route provides a network path, but firewall rules must also allow the traffic.

## Internet Gateway

An **Internet Gateway (IGW)** connects a VPC to the internet.

For an EC2 instance to use direct IPv4 internet access, it needs:

- An Internet Gateway attached to the VPC.
- A subnet route pointing to that gateway.
- A public IPv4 address or Elastic IP.
- Security Group and network ACL rules that allow the traffic.

Adding an Internet Gateway alone does not make every instance publicly accessible.

## NAT Gateway

**NAT** stands for Network Address Translation. A public NAT Gateway lets instances in a private subnet start internet connections while preventing new connections started from the internet.

**Example:** A private application server downloads software updates through a NAT Gateway.

In a common setup, the public NAT Gateway is in a public subnet with an Elastic IP. The private subnet routes internet traffic to it, and the public subnet routes that traffic to the Internet Gateway.

```text
Private instance -> Public NAT Gateway -> Internet Gateway -> Internet
                 <-       Replies return along this path          <-
```

The private instance does not need its own public IP. NAT Gateways also have costs for their use and data processing.

## Security Groups

A Security Group is a virtual firewall attached to resource network interfaces. It has inbound and outbound **allow rules**.

**Example:** A database Security Group allows its database port only from the application server's Security Group.

Security Groups are **stateful**, so replies to allowed connections are automatically permitted.

## Network ACLs

A **Network Access Control List (NACL)** filters traffic entering and leaving a subnet. It supports both allow and deny rules.

Rules are checked in number order, starting with the lowest number. The first matching rule is used.

NACLs are **stateless**, so we must allow both the request and its reply traffic.

| Feature | Security Group | Network ACL |
| :-- | :-- | :-- |
| Applies to | Resource network interfaces | Subnet boundary |
| Rules | Allow only | Allow and deny |
| Reply traffic | Automatically allowed for an allowed connection | Must be allowed separately |

## Public vs private subnet

| Public subnet | Private subnet |
| :-- | :-- |
| Has a direct route to an Internet Gateway | Has no direct route to an Internet Gateway |
| Used for internet-facing resources | Used for internal applications and databases |
| Resources still need suitable IP addresses and firewall rules | Resources can use NAT for outgoing internet access |

A private subnet without an outside route is often called an **isolated subnet**.

## References

- [AWS: What is VPC?](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)
- [AWS: Subnets](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html)
- [AWS: Route tables](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html)
- [AWS: Internet Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html)
- [AWS: NAT Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)
- [AWS: Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)
- [AWS: Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)
