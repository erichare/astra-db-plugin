from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert a document
collection.insert_one(
    {
        "name": "Jane Doe",
        "$lexical": "An active hiker, runner, and triathlete who loves the outdoors.",
    },
)
