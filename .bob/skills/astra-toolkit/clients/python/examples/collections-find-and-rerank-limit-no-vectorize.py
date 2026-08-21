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
            "$vector": [0.08, -0.62, 0.39],
            "$lexical": "house hill grassy",
        },
    },
    rerank_query="A tree in the woods",
    rerank_on="$lexical",
    limit=2,
)

# Iterate over the found documents
for result in cursor:
    print(result.document)
