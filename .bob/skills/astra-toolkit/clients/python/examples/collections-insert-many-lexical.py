from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert documents
result = collection.insert_many(
    [
        {
            "name": "Jane Doe",
            "$lexical": "An author who writes SciFi and fantasy novels.",
        },
        {
            "name": "Mary Day",
            "$lexical": "An active hiker, runner, and triathlete who loves the outdoors.",
        },
    ]
)
