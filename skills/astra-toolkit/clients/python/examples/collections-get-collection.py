from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Get a collection
collection = database.get_collection("**COLLECTION_NAME**")
