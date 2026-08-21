from astrapy import DataAPIClient
from astrapy.constants import DefaultIdType
from astrapy.info import CollectionDefinition

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a collection
collection_definition = (
    CollectionDefinition.builder()
    .set_default_id(DefaultIdType.OBJECTID)
    .build()
)
collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.constants import DefaultIdType
from astrapy.info import (
    CollectionDefaultIDOptions,
    CollectionDefinition,
)

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a collection
collection_definition = CollectionDefinition(
    default_id=CollectionDefaultIDOptions(DefaultIdType.OBJECTID),
)
collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)
