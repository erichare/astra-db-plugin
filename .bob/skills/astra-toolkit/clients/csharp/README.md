# C# client

The package is `astra-db-csharp`.

```
dotnet add package DataStax.AstraDB.DataApi
```

## Connect to HCD

E.g. `ENDPOINT="http://localhost:8181"`:

```
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Core;

var client = new DataAPIClient(
    new CommandOptions() { Destination = DataAPIDestination.HCD }
);

var database = client.GetDatabase(
    ENDPOINT,
    DataAPIClient.UsernamePasswordTokenProvider(USERNAME, PASSWORD),
    KEYSPACE
);

// what follows is like for Astra DB ...
```
