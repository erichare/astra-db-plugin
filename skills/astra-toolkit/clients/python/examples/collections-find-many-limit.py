from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find documents
cursor = collection.find({"metadata.language": "English"}, limit=10)

# Iterate over the found documents
for document in cursor:
    print(document)
