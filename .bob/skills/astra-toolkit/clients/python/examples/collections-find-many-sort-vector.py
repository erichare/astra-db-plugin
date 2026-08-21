from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find documents
cursor = collection.find(
    {}, sort={"$vectorize": "Text to vectorize"}, include_sort_vector=True
)

# Get the sort vector from the result
vector = cursor.get_sort_vector()

print(vector)
