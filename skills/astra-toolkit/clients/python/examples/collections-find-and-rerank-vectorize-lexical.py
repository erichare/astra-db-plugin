from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find documents
cursor = collection.find_and_rerank(
    sort={
        "$hybrid": {
            "$vectorize": "A tree in the woods",
            "$lexical": "house hill grassy",
        },
    },
)

# Iterate over the found documents
for result in cursor:
    print(result.document)
