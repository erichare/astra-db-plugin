# Java client

Examples: [INDEX.md](INDEX.md) maps every snippet in [examples/](examples/) by category and operation. Snippets read `ASTRA_DB_APPLICATION_TOKEN` / `ASTRA_DB_API_ENDPOINT` from the environment.

The package is `astra-db-java`. Use at least version 2.3.1 (then check with the user, if needed, for a later version).

The dependency is installed as follows:

## Maven

```
<dependencies>
  <dependency>
    <groupId>com.datastax.astra</groupId>
    <artifactId>astra-db-java</artifactId>
    <version>VERSION</version>
  </dependency>
</dependencies>
```


## Gradle

```
dependencies {
    implementation 'com.datastax.astra:astra-db-java:VERSION'
}
```

## Connect to HCD

E.g. `ENDPOINT="http://localhost:8181"`:

```
import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.DataAPIClients;
import com.datastax.astra.client.databases.Database;

DataAPIClient client = DataAPIClients.clientHCD(USERNAME, PASSWORD);

Database database = client.getDatabase(ENDPOINT, KEYSPACE);

// what follows is like for Astra DB ...
```
