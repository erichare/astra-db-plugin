from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# List collections
database.list_collections()
