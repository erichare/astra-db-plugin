from astrapy import DataAPIClient

# Get a database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a collection
collection = database.create_collection("**COLLECTION_NAME**")
