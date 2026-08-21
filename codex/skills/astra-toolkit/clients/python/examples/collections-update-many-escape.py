from astrapy import DataAPIClient
from astrapy.utils.document_paths import escape_field_names

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.update_many(
    {
        "$and": [
            {escape_field_names("areas", "r&d"): False},
            {escape_field_names("costs", "price.usd"): {"$lt": 300}},
        ]
    },
    {
        "$set": {
            escape_field_names("areas", "r&d"): True,
            escape_field_names("costs", "price.usd"): 310,
        }
    },
)

print(result)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.update_many(
    {
        "$and": [
            {"areas.r&&d": False},
            {"costs.price&.usd": {"$lt": 300}},
        ]
    },
    {"$set": {"areas.r&&d": True, "costs.price&.usd": 310}},
)

print(result)
