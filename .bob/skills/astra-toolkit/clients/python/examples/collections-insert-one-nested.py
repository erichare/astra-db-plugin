from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert a document into the collection
result = collection.insert_one(
    {
        "title": "Hidden Shadows of the Past",
        "genres": ["Biography", "Graphic Novel", "Dystopian", "Drama"],
        "metadata": {
            "isbn": "978-1-905585-40-3",
            "language": "French",
            "edition": "Anniversary Edition",
        },
    },
)
