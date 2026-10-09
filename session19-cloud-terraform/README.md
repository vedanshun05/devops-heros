# Session 19 — Cloud and Terraform: completed extended project

The extended [EC2 + private S3 project](08-mini-project/README.md) was applied and verified in Mumbai (`ap-south-1`) on **9 October 2026**, then destroyed. Terraform created 15 resources. EC2 downloaded the website from private S3 through its instance role and served it with Nginx.

| Check | Observed result |
| :-- | :-- |
| VPC | `vpc-09c4f6131f8a643fd`, `10.20.0.0/16` |
| EC2 | `i-0fa3ad6f3b6f19312`, running `t3.micro`, IMDSv2 required |
| S3 | `session19-mini-assets-c24e140d4c49720953eb6641e1`, all four public access blocks enabled |
| Website | HTTP response and browser page at `13.207.151.91` verified before teardown |
| Cleanup | `Destroy complete! Resources: 15 destroyed.`; state list empty |

The address above is historical evidence; the lab is no longer running. Credentials, state and saved plans remain excluded from Git.

```mermaid
flowchart LR
  Browser -->|HTTP 80| IGW[Internet Gateway]
  IGW --> EC2[Public subnet: EC2 + Nginx]
  EC2 -->|IAM role: authenticated download| S3[Private S3: index.html]
  Terraform --> VPC[VPC 10.20.0.0/16]
  VPC --> EC2
  Terraform --> S3
```

![Initialization and validation](Outputs/mini-project/extended-init-validate.png)
![Reviewed plan](Outputs/mini-project/extended-plan.png)
![Successful apply](Outputs/mini-project/extended-apply.png)
![Actual resource state and outputs](Outputs/mini-project/extended-state-output.png)
![AWS API checks: running EC2 and private S3](Outputs/mini-project/extended-aws-verification.png)
![Website served by EC2](Outputs/mini-project/extended-website.png)
![Verified teardown](Outputs/mini-project/extended-destroy.png)

The earlier screenshots below document the original networking exercises. The images above prove the extended mini-project separately.

---

# Task

![mini-1](./Outputs/mini-project/mini-1.png)

## Plan

![mini-plan-1](./Outputs/mini-project/mini-plan-1.png)
![mini-plan-2](./Outputs/mini-project/mini-plan-2.png)
![mini-plan-3](./Outputs/mini-project/mini-plan-3.png)
![mini-plan-4](./Outputs/mini-project/mini-plan-4.png)
![mini-plan-5](./Outputs/mini-project/mini-plan-5.png)
![mini-plan-6](./Outputs/mini-project/mini-plan-6.png)
![mini-plan-7](./Outputs/mini-project/mini-plan-7.png)
![mini-plan-8](./Outputs/mini-project/mini-plan-8.png)

![mini-apply](./Outputs/mini-project/mini-apply.png)
![mini-state-output](./Outputs/mini-project/mini-state-output.png)
![mini-web](./Outputs/mini-project/mini-web.png)
![mini-verify](./Outputs/mini-project/mini-verify.png)

## Destroy

![destroy-1](./Outputs/mini-project/mini-destroy-1.png)
![destroy-2](./Outputs/mini-project/mini-destroy-2.png)
![destroy-3](./Outputs/mini-project/mini-destroy-3.png)
![destroy-4](./Outputs/mini-project/mini-destroy-4.png)
![destroy-5](./Outputs/mini-project/mini-destroy-5.png)
![destroy-6](./Outputs/mini-project/mini-destroy-6.png)
![destroy-7](./Outputs/mini-project/mini-destroy-7.png)
![destroy-8](./Outputs/mini-project/mini-destroy-8.png)
![destroy-9](./Outputs/mini-project/mini-destroy-9.png)
![destroy-10](./Outputs/mini-project/mini-destroy-10.png)
