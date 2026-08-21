from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Drop an index
database.drop_table_index("**INDEX_NAME**", if_exists=True)
