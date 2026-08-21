from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert documents to the collection
# The following also demonstrates use of both plain lists and DataAPIVector
result = collection.insert_many(
    [
        {"name": "Jane Doe", "age": 42, "$vector": [0.08, -0.62, 0.39]},
        {
            "nickname": "Bobby",
            "$vector": [0.12, 0.53, 0.32],
        },
    ]
)
