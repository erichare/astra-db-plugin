import os
from astrapy import DataAPIClient
from astrapy.utils.document_paths import escape_field_names

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.find_one_and_replace(
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

import os
from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.find_one_and_replace(
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
