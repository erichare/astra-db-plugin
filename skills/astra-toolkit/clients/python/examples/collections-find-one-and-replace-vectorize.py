from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Replace a document
result = collection.find_one_and_replace(
    {},
    {"name": "Jane Doe", "age": 42},
    sort={"$vectorize": "Text to vectorize"},
)

print(result)
