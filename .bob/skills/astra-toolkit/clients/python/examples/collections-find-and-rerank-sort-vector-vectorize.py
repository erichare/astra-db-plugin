from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find documents
cursor = collection.find_and_rerank(
    sort={"$hybrid": "A tree in the woods"},
    include_sort_vector=True,
)

# Inspect the sort vector
print(cursor.get_sort_vector())
