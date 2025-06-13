---
title: Finally JSON_TABLE() is here
slug: JSON_TABLE
date: September 8, 2024
description: All that you should know about Postresql JSON support enhancement.
photo: /projects/example-project-1.jpg
---

In today’s data‑driven world, JSON has become the backbone of modern application development… Its flexible and lightweight structure allows developers to easily transmit and store data, making it an indispensable format for APIs, configurations, and document stores.

> **“PostgreSQL has long been a pioneer in JSON support… With the release of PostgreSQL 17, they’ve introduced even more powerful features for working with JSON, such as `JSON_TABLE`, SQL/JSON constructors (like `JSON`, `JSON_SCALAR`, `JSON_SERIALIZE`), and query functions (`JSON_EXISTS`, `JSON_QUERY`, `JSON_VALUE`).”**

These new features provide developers with more sophisticated ways to interact with and extract value from their JSON data.

> **“Additionally, this release expands JSONPath expressions, emphasizing converting JSON data to native PostgreSQL data types, including numeric, boolean, string, and date/time types.”**

I’ve been using Postgres extensively… dealing with JSON can lead to complex or unreadable SQL. Thankfully, Postgres has greatly improved its JSON support over time. In PostgreSQL 17, several new features assist with JSONB data—most notably, the long-awaited `JSON_TABLE`.

`JSON_TABLE` was first proposed by Andrew Dunstan and nearly made it into PostgreSQL 16, but was postponed. Other databases like MySQL, Oracle, and SQL Server already have it. Now Postgres 17 finally includes it.

According to the docs:

> **"`JSON_TABLE` is an SQL/JSON function which queries JSON data and presents the results as a relational view… You can use `JSON_TABLE` inside the `FROM` clause of a `SELECT`, `UPDATE`, or `DELETE` and as data source in a `MERGE` statement.”**

> **“…uses a JSON path expression to extract a part of the provided data to use as a row pattern… `COLUMNS` clause defines the schema… Each SQL/JSON value… becomes the value for the specified column in a given output row.”**

---

## Use Case

A good use case for `JSON_TABLE` is when structured data is stored as JSON but you need to query it using traditional SQL operations. It maps parts of the JSON document into rows/columns, enabling joins, filters, aggregations, or inserts into existing tables.

---

## Hands‑On: Using Docker + Postgres 17

**Prerequisites:**

- Docker Desktop
- DBeaver (or any DB tool) or terminal

### 1. Init Scripts

Create `postgres-init/01-create_role.sh`:

```
#!/bin/bash
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE ROLE myrole WITH LOGIN PASSWORD 'mypassword';
EOSQL
```

Create `postgres-init/02-create_table_schema_and_insert.sh`:

```bash
#!/bin/bash
set -e
echo "creating schema"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE TABLE IF NOT EXISTS public.products (
      id integer NOT NULL,
      product_name varchar NOT NULL,
      data jsonb
    );
    INSERT INTO public.products (id, product_name, data)
    VALUES
      (1, 'iPhone 16', jsonb_build_object(
        'brand', 'Apple',
        'model', '16',
        'release_year', 2024,
        'specifications', jsonb_build_object(
          'screen_size', '6.7 inches',
          'processor', 'Apple A18 Bionic',
          'ram', '8 GB',
          'storage', '256 GB',
          'battery', '4500 mAh',
          'camera', jsonb_build_object(
            'rear', jsonb_build_array(
              jsonb_build_object('type', 'Wide', 'megapixels', 108),
              jsonb_build_object('type', 'Ultra‑wide', 'megapixels', 12),
              jsonb_build_object('type', 'Telephoto', 'megapixels', 12)
            ),
            'front', jsonb_build_object('type', 'Wide', 'megapixels', 32)
          )
        ),
        'features', jsonb_build_array(
          '5G capable',
          'Water‑resistant (IP68)',
          'Wireless charging',
          'Fast charging support',
          'Face ID',
          'ProMotion 120Hz display'
        ),
        'warranty', '2 years',
        'price', 1199.99
      )),
      (2, 'Macbook Pro 2023', jsonb_build_object(
        'brand', 'Apple',
        'model', 'Pro 2023',
        'release_year', 2023,
        'specifications', jsonb_build_object(
          'screen_size', '15.6 inches',
          'processor', 'M3 pro',
          'ram', '16 GB',
          'storage', '512 GB SSD',
          'graphics_card', 'M3 pro',
          'battery', 'Up to 14 hours'
        ),
        'features', jsonb_build_array(
          'Backlit keyboard',
          'Fingerprint reader',
          'Thunderbolt 4 ports',
          'Retina display'
        ),
        'warranty', '1 year',
        'price', 1499.99
      )),
      (3, 'Sony Headphones Pro', jsonb_build_object(
        'brand', 'AudioSound',
        'model', 'Sony WH‑CH720n',
        'release_year', 2021,
        'specifications', jsonb_build_object(
          'connectivity', 'Bluetooth 5.0',
          'battery_life', '35 hours',
          'driver_size', '40mm',
          'weight', '250 grams'
        ),
        'features', jsonb_build_array(
          'Active noise cancellation',
          'Button controls',
          'Voice assistant integration',
          'Water‑resistant design'
        ),
        'warranty', '1 year',
        'price', 299.99
      ));
EOSQL
```

### 2. `docker-compose.yml`

```yaml
services:
  db1:
    image: postgres:17.0
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: dbpassword
    ports:
      - "5432:5432"
    command: postgres -c 'max_connections=1000'
    volumes:
      - ./postgres-init/01-create_role.sh:/docker-entrypoint-initdb.d/01-create_role.sh
      - ./postgres-init/02-create_table_schema_and_insert.sh:/docker-entrypoint-initdb.d/02-create_table_schema_and_insert.sh
```

### 3. Start & Verify

```bash
docker-compose up -d
docker ps
```

You should see a running Postgres 17 container (e.g., `postgres-17-docker-db1-1`).

### 4. Connect to DB

- **DBeaver connection**

  ```
  Host: localhost
  Database: postgres
  Username: admin
  Password: dbpassword
  ```

- **Terminal**

  ```bash
  docker exec -it <container_id> bash
  psql -U username -d database_name
  ```

---

## 📌 Time to Run SQL Queries

Example query using `JSON_TABLE`:

```sql
SELECT jt.*
FROM public.products,
     JSON_TABLE(
         data,
         '$'
         COLUMNS (
             brand text PATH '$.brand',
             model text PATH '$.model',
             release_year integer PATH '$.release_year',
             specifications jsonb PATH '$.specifications',
             features jsonb PATH '$.features',
             warranty text PATH '$.warranty',
             price numeric PATH '$.price'
         )
     ) AS jt;
```

**Result:**

| brand | model | release_year | specifications | features | warranty | price |
| ----- | ----- | ------------ | -------------- | -------- | -------- | ----- |
| ...   | ...   | ...          | ...            | ...      | ...      | ...   |

### Query Breakdown

- **`JSON_TABLE(data, '$' … )`**: queries the whole JSON object
- **COLUMNS clause**: defines schema for extracted fields

Other features include PASSING parameters for filtering and NESTED PATH to normalize data. See the Postgres docs for more details.

---

## Further Reading

- Postgres docs example: SQL/JSON Path & `JSON_TABLE`
- Follow-up blog on `JSON_EXISTS`, `JSON_QUERY`, and `JSON_VALUE` [here](https://medium.com/@atarax/simplify-json-data-handling-in-postgresql-with-json‑query‑json‑exists‑and‑json‑value‑0572d840dc3e)
