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
    projection={
        escape_field_names("areas", "r&d"): True,
        escape_field_names("costs", "price.usd"): True,
    },
    sort={
        escape_field_names("areas", "r&d"): SortMode.ASCENDING,
        escape_field_names("costs", "price.usd"): SortMode.DESCENDING,
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
    projection={"areas.r&&d": True, "costs.price&.usd": True},
    sort={
        "areas.r&&d": SortMode.ASCENDING,
        "costs.price&.usd": SortMode.DESCENDING,
    },
)

print(result)
