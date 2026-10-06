# DynamoDB and RDS — Database Services

## DynamoDB

### What is DynamoDB?

Amazon DynamoDB is a fully managed NoSQL database. It stores key-value and document data.

It is **serverless**, which means we do not manage database servers. AWS manages the infrastructure, and we work with tables and data.

### NoSQL

NoSQL databases use data models other than traditional relational tables. DynamoDB items can have different attributes, so we do not need to define every field in advance.

DynamoDB supports transactions, but it does not support SQL joins. We design the data around how the application will look it up.

### Tables

A table is a collection of related data.

**Example:** A `StudentResults` table stores exam results for students.

### Items

An item is one record inside a table. It is similar to a row in a relational database.

**Example:** One item stores a student's result for one subject.

### Attributes

Attributes are the named values inside an item. They are similar to fields or columns.

**Example:** `student_id`, `subject`, and `marks` are attributes.

### Partition key

The partition key is the required part of a table's primary key. DynamoDB uses its value to decide where to store data.

If a table has only a partition key, each item must have a different partition key value.

**Example:** In a `Students` table, `student_id` can identify each student.

### Sort key

A sort key is an optional second part of the primary key. It orders items that share the same partition key.

When both keys are used, their combination must be unique.

**Example:** In `StudentResults`, use `student_id` as the partition key and `subject` as the sort key.

| `student_id` (partition key) | `subject` (sort key) | `marks` |
| :-- | :-- | --: |
| `S101` | DevOps | 85 |
| `S101` | Networking | 90 |
| `S102` | DevOps | 80 |

`S101` can have two items because the subject values are different. We can query `S101` to get that student's results, or use both keys to get one subject's result.

### Use cases

- Shopping carts and user sessions.
- Game scores and player data.
- Device readings and application events.
- Applications needing fast key-based lookups.

## RDS

### What is RDS?

RDS stands for **Relational Database Service**. It makes it easier to create and manage relational databases in AWS.

AWS handles tasks such as database installation, patching, and backups. We still manage our data, queries, and access settings.

### Relational database

A relational database stores data in tables with rows and columns. Tables can be connected using keys, and we use SQL to read and update data.

**Example:** A `Students` table stores student details, and a `Results` table stores marks. We can join them using `student_id` to display each student's name and marks.

### Supported engines

A database engine is the software that stores and manages the database. RDS supports:

- PostgreSQL
- MySQL
- MariaDB
- Oracle Database
- Microsoft SQL Server
- IBM Db2

Amazon Aurora is also part of the RDS service family. It offers MySQL-compatible and PostgreSQL-compatible engines with a different storage architecture.

### DB instances

A DB instance is a managed database environment in RDS. We choose its engine, CPU and memory capacity, and storage.

Applications connect using an **endpoint**, which is the database's network address, along with the required connection details.

**Example:** A web application connects to an RDS MySQL instance to save student records.

### Security

- Keep the database in private subnets when public access is unnecessary.
- Use Security Groups to allow only the required clients and database port.
- Use database users with only the permissions they need.
- Use IAM to control who can create or manage RDS resources.
- Enable encryption for stored data and TLS for network connections.
- Store database passwords securely, such as in AWS Secrets Manager.

Permission to manage RDS through AWS does not automatically give permission to read its tables.

### Backups

RDS provides two common backup options:

- **Automated backups:** allow recovery to a time within the configured backup retention period.
- **Manual snapshots:** backups we create and keep until we delete them.

**Example:** After an accidental data change, restore a backup to a new database and connect the application to its endpoint.

### Multi-AZ

**Multi-AZ** means using multiple Availability Zones to improve availability.

In a Multi-AZ DB instance deployment, RDS keeps a primary database and a synchronized standby in another AZ. If the primary fails, RDS can switch to the standby. This is called **failover**.

That standby does not serve read queries. RDS also offers a Multi-AZ DB cluster option with two readable standby instances for supported engines.

### Read replicas

A read replica is a copy of a database used mainly to handle read queries. This reduces the read load on the main database.

Updates are generally copied asynchronously, so a replica may briefly show older data.

**Example:** Send report queries to a read replica while the primary handles updates.

| Feature | Main purpose |
| :-- | :-- |
| Multi-AZ DB instance deployment | Availability and automatic failover |
| Read replica | Handling more read queries |
| Backup | Recovering lost or damaged data |

A replica is not a replacement for backups because accidental changes can also be copied to it.

### Use cases

- Student-management systems.
- Online stores with customers, orders, and inventory.
- Accounting and business applications.
- Applications that already use a supported SQL database.

## DynamoDB vs RDS

| DynamoDB | RDS |
| :-- | :-- |
| NoSQL key-value and document database | Relational database service |
| Items can have different non-key attributes | Data follows the database's table structure |
| Good for predictable key-based lookups | Good for related data and SQL joins |
| No database servers to manage | AWS manages the chosen database environment |

## References

- [AWS: What is DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [AWS: Tables, items, attributes, and keys](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)
- [AWS: DynamoDB queries](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html)
- [AWS: What is RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [AWS: Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html)
- [AWS: DB instances](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.html)
- [AWS: RDS security](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)
- [AWS: Encryption](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html)
- [AWS: Backups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html)
- [AWS: Multi-AZ](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)
- [AWS: Read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html)
