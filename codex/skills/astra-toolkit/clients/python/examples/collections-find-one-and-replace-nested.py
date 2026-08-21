from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Replace a document
result = collection.find_one_and_replace(
    {"metadata.language": "English"},
    {
        "title": "Hidden Shadows of the Past",
        "number_of_pages": 481,
        "genres": ["Biography", "Graphic Novel", "Dystopian", "Drama"],
        "metadata": {
            "isbn": "978-1-905585-40-3",
            "language": "French",
            "edition": "Anniversary Edition",
        },
    },
)

print(result)
