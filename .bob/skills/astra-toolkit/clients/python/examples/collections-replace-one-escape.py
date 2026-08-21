from astrapy import DataAPIClient
from astrapy.utils.document_paths import escape_field_names

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.replace_one(
    {
        "$and": [
            {escape_field_names("areas", "r&d"): False},
            {escape_field_names("costs", "price.usd"): {"$lt": 300}},
        ]
    },
    {
        "areas": {"r&d": False, "design": True},
        "costs": {"price.usd": 100, "price.cad": 90},
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
result = collection.replace_one(
    {
        "$and": [
            {"areas.r&&d": False},
            {"costs.price&.usd": {"$lt": 300}},
        ]
    },
    {
        "areas": {"r&d": False, "design": True},
        "costs": {"price.usd": 100, "price.cad": 90},
    },
)

print(result)
