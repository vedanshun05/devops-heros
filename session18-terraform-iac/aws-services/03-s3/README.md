# S3 — Storage

## What is S3?

S3 stands for **Simple Storage Service**. It is an AWS service that stores data as objects.

We can store images, videos, documents, backups, and logs. We access the data through the AWS console, CLI, or application APIs.

**Example:** A website stores uploaded profile photos in S3.

## Buckets

A bucket is a container for S3 objects. We create it in an AWS Region and configure settings such as access permissions and versioning.

**Example:** A bucket named `example-course-assets` contains files for a course website.

## Objects

An object contains the file data, a **key**, and **metadata**.

- **Key:** the name used to identify the object in a bucket.
- **Metadata:** information about the object, such as its content type.

```text
Bucket: example-course-assets
  Object key: images/logo.png
  Object key: notes/terraform.md
```

The `/` in a key makes the console display folders, but the object is still stored using its full key.

## Storage classes

A storage class decides how an object is stored and retrieved. We choose it based on how often we need the data.

| Storage class | Suitable for |
| :-- | :-- |
| S3 Standard | Frequently accessed files |
| S3 Intelligent-Tiering | Files whose access frequency changes; AWS moves them between access tiers |
| S3 Standard-IA | Infrequently accessed files that must be available immediately |
| S3 One Zone-IA | Infrequently accessed, replaceable data stored in one Availability Zone |
| S3 Glacier Instant Retrieval | Archive data that must be available immediately |
| S3 Glacier Flexible Retrieval | Archive data that can wait for restoration |
| S3 Glacier Deep Archive | Long-term archives with a longer restoration wait |
| S3 Express One Zone | Data needing fast access in one Availability Zone; uses directory buckets |

**IA** means Infrequent Access. An **Availability Zone** is an isolated location within an AWS Region.

Lower storage cost can come with retrieval fees, minimum storage periods, or monitoring fees. Choose based on the total cost and how quickly the data is needed.

## Versioning

Versioning keeps multiple versions of an object when it is updated.

**Example:** If we overwrite `notes.txt` by mistake, we can recover an earlier version.

In a versioned bucket, a normal delete adds a **delete marker**, which hides the object without deleting its older versions. Old versions use storage and can still be permanently deleted by someone with permission.

## Lifecycle policies

Lifecycle policies automatically manage objects as they get older.

They can:

- Move objects to another storage class.
- Delete objects after the required retention period.
- Remove old versions separately.
- Clean up unfinished multipart uploads, where a large file was uploaded in parts.

**Example:** Keep recent logs in S3 Standard, move older logs to an archive class, and delete them when they are no longer required.

## Encryption

Encryption protects data by making it unreadable without the required key.

- **At rest:** protects data stored in S3. New uploads use SSE-S3 encryption by default.
- **SSE-KMS:** uses AWS Key Management Service for more control over encryption keys.
- **In transit:** HTTPS/TLS protects data while it moves between the client and S3.

Encryption and access permissions serve different purposes. We still need to control who can read the objects.

## Bucket policies

A bucket policy is a JSON document that controls access to a bucket and its objects.

It specifies **who** can access them, **which actions** they can perform, and any extra conditions.

**Example:** Allow an application's IAM role to read objects while denying requests that do not use HTTPS.

Keep **Block Public Access** enabled for private data. Give only the required permissions. Access logs and CloudTrail data events can help record object access when needed.

## Common use cases

- Storing user uploads and website assets.
- Keeping backups and archives.
- Storing application logs.
- Storing datasets for analysis.
- Keeping build files and deployment packages.

## References

- [AWS: What is S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [AWS: Storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [AWS: Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
- [AWS: Lifecycle policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)
- [AWS: Security best practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [AWS: Bucket policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)
