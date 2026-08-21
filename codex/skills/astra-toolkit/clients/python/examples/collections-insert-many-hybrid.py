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
            "$vector": [0.08, -0.62, 0.39],
            "$lexical": "An author who writes SciFi and fantasy novels.",
        },
        {
            "name": "Mary Day",
            "$vectorize": "An athlete who loves biking, hiking, running, and swimming in the outdoors",
            "$lexical": "She shares her love of triathlons by coaching kids after school.",
        },
        {
            "name": "Bobby",
            "$hybrid": "A software developer who enjoys managing databases",
        },
    ]
)
