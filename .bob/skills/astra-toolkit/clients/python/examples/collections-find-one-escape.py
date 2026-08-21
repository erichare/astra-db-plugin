from astrapy import DataAPIClient
from astrapy.constants import SortMode
from astrapy.utils.document_paths import escape_field_names

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
            {escape_field_names("areas", "r&d"): False},
            {escape_field_names("costs", "price.usd"): {"$lt": 300}},
        ]
    },
    sort={escape_field_names("costs", "price.usd"): SortMode.ASCENDING},
    projection={
        escape_field_names("areas", "r&d"): True,
        escape_field_names("costs", "price.cad"): True,
    },
)

print(result)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

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
            {"areas.r&&d": False},
            {"costs.price&.usd": {"$lt": 300}},
        ]
    },
    sort={"costs.price&.usd": SortMode.ASCENDING},
    projection={"areas.r&&d": True, "costs.price&.cad": True},
)

print(result)
