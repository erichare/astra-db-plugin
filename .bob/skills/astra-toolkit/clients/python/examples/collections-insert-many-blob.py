from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert a document with binary fields
result = collection.insert_many(
    [
        {
            "exampleBinary": {"$binary": "PfvnbT7peNU/Sfvn"},
            "anotherExampleBinary": b"=\xfb\xe7m>\xe9x\xd5?I\xfb\xe7",
        }
    ]
)
