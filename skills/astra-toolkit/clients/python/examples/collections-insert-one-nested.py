import os
from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
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
