from astrapy import DataAPIClient
from astrapy.info import CollectionDefinition

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a collection
collection_definition = (
    CollectionDefinition.builder()
    .set_indexing("allow", ["city", "country"])
    .build()
)
collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.info import CollectionDefinition

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a collection
collection_definition = CollectionDefinition(
    indexing={"allow": ["city", "country"]},
)
collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)
