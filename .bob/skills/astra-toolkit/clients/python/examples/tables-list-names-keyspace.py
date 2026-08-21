from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# List table names
result = database.list_table_names(keyspace="**KEYSPACE_NAME**")
print(result)
