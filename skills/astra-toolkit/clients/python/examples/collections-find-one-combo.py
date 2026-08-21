from astrapy import DataAPIClient
from astrapy.constants import SortMode

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.find_one(
    {
        "$and": [
            {"is_checked_out": False},
            {"number_of_pages": {"$lt": 300}},
        ]
    },
    sort={
        "rating": SortMode.ASCENDING,
        "title": SortMode.DESCENDING,
    },
    projection={"is_checked_out": True, "title": True},
)

print(result)
