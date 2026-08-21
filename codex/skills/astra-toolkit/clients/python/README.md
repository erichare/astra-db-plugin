# Python client

The package is `astrapy`.

```
pip install "astrapy>=2.0,<3.0"
```

## Sync vs. async

Database, collection and table classes have an async counterpart. Use that preferrably.

For example, instead of this:

```
db = client.get_database(...)
collection = db.get_collection(...)  # instance of Collection
collection.insert_one(...)
```

do this:

```
db = client.get_async_database(...)
collection = db.get_collection(...)  # instance of AsyncCollection
await collection.insert_one(...)  # requires e.g. an asyncio context
```

## Get help

In case of real need, query the docstrings, e.g. assuming the client is installed:

```
python -c "import astrapy; help(astrapy.DataAPIClient)" | cat
```

## Connect to HCD

E.g. `ENDPOINT="http://localhost:8181"`:

```
from astrapy import DataAPIClient
from astrapy.authentication import UsernamePasswordTokenProvider
from astrapy.constants import Environment

client = DataAPIClient(environment=Environment.HCD)

database = client.get_database(
    ENDPOINT,
    token=UsernamePasswordTokenProvider(USERNAME, PASSWORD),
    keyspace=KEYSPACE,
)
# what follows is like for Astra DB ...
```
