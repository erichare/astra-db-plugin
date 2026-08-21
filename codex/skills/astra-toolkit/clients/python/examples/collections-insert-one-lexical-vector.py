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
        "$vector": [0.08, -0.62, 0.39],
        "$lexical": "An athlete who loves biking, hiking, running, and swimming in the outdoors",
    },
)
