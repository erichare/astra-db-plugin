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
        "$vectorize": "An athlete who loves biking, hiking, running, and swimming in the outdoors",
        "$lexical": "She shares her love of triathlons by coaching kids after school",
    },
)
