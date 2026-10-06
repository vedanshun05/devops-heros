# IAM — Governance

## What is IAM?

IAM stands for **Identity and Access Management**. It is an AWS service that controls who can access AWS resources and what they can do.

- **Authentication:** checking who you are when you sign in.
- **Authorization:** checking what you are allowed to do after signing in.

For example, a developer may be allowed to view an EC2 instance but not delete it. IAM helps manage these access rules.

## Users

An IAM user is an identity created inside an AWS account. It can represent a person or an application.

A user can have a password for console access or access keys for programmatic access. The user needs permissions to work with AWS resources.

**Example:** A user named `student` is given permission to read files from an S3 bucket.

## Groups

An IAM group is a collection of IAM users. Policies attached to the group give permissions to its members.

**Example:** Instead of giving the same permissions to five developers separately, add them to a `Developers` group and attach the policy to the group.

A user can belong to more than one group. Groups contain users, not roles or other groups.

## Roles

An IAM role is an identity that a trusted user, application, or AWS service can temporarily use. Using a role is called **assuming the role**.

Roles provide temporary credentials instead of permanent passwords or access keys.

- A **trust policy** defines who can assume the role.
- A **permissions policy** defines what the role can do.

**Example:** An EC2 instance uses a role to upload files to S3 without storing access keys in its application code.

## Policies

A policy is a document that defines access rules. Most AWS policies are written in JSON.

The main fields are:

| Field | Meaning |
| :-- | :-- |
| `Effect` | Whether to allow or deny access |
| `Action` | The operation, such as reading an S3 object |
| `Resource` | The AWS resource the rule applies to |
| `Condition` | An optional extra requirement |

Policies can be attached to users, groups, roles, or supported resources such as S3 buckets.

## Permissions

Permissions describe the actions an identity is allowed to perform.

**Example:** `s3:GetObject` allows reading an S3 object. It does not allow uploading or deleting that object.

A policy defines the rules; permissions are the access those rules provide. Access is normally denied unless allowed. An explicit deny overrides an allow, and other applicable policies can also restrict access.

## Least privilege

Least privilege means giving only the permissions needed to complete a task.

**Example:** If a student only needs to view files, give read access to the required bucket rather than full access to all S3 buckets.

This reduces the damage caused by mistakes or stolen credentials.

## IAM best practices

- Use the root account only for tasks that require it.
- Enable **MFA (Multi-Factor Authentication)**, which adds another sign-in check.
- Prefer temporary credentials and roles. For people, AWS recommends IAM Identity Center to manage sign-in and access centrally.
- Follow least privilege and review permissions regularly.
- Never share credentials or store access keys in Git.
- Remove unused users, credentials, and permissions.
- Use **CloudTrail** to record AWS API activity for auditing.

## Common use cases

- Giving different access to developers, administrators, and auditors.
- Allowing EC2 applications to access S3.
- Giving a deployment pipeline permission to deploy resources.
- Allowing trusted users to access resources in another AWS account.

## References

- [AWS: What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
- [AWS: Users, groups, and roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id.html)
- [AWS: Policies and permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [AWS: Policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [AWS: IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
