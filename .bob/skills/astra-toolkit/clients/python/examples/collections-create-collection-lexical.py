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
    .set_lexical(
        {
            "tokenizer": {"name": "standard", "args": {}},
            "filters": [
                {"name": "lowercase"},
                {"name": "stop"},
                {"name": "porterstem"},
                {"name": "asciifolding"},
            ],
            "charFilters": [],
        }
    )
    .build()
)
collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.info import (
    CollectionDefinition,
    CollectionLexicalOptions,
)

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a collection
collection_definition = CollectionDefinition(
    lexical=CollectionLexicalOptions(
        analyzer={
            "tokenizer": {"name": "standard", "args": {}},
            "filters": [
                {"name": "lowercase"},
                {"name": "stop"},
                {"name": "porterstem"},
                {"name": "asciifolding"},
            ],
            "charFilters": [],
        },
        enabled=True,
    ),
)
collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)
