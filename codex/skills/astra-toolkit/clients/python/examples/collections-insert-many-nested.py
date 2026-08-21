from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert documents into the collection
result = collection.insert_many(
    [
        {
            "title": "Hidden Shadows of the Past",
            "genres": [
                "Biography",
                "Graphic Novel",
                "Dystopian",
                "Drama",
            ],
            "metadata": {
                "isbn": "978-1-905585-40-3",
                "language": "French",
                "edition": "Anniversary Edition",
            },
        },
        {
            "title": "Bake a Dozen",
            "genres": ["Biography", "Fiction"],
            "metadata": {
                "isbn": "342-2-875587-50-2",
                "language": "English",
                "edition": "Illustrated Edition",
            },
        },
    ]
)
