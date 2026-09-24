import os
from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)

# List table names
result = database.list_table_names(keyspace="**KEYSPACE_NAME**")
print(result)
