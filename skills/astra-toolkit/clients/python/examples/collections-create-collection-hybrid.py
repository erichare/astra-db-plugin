from astrapy import DataAPIClient
from astrapy.constants import VectorMetric
from astrapy.info import (
    CollectionDefinition,
    CollectionLexicalOptions,
    CollectionRerankOptions,
    CollectionVectorOptions,
    RerankServiceOptions,
    VectorServiceOptions,
)

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a collection
collection_definition = CollectionDefinition(
    vector=CollectionVectorOptions(
        metric=VectorMetric.COSINE,
        dimension=1024,
        service=VectorServiceOptions(
            provider="nvidia",
            model_name="nvidia/nv-embedqa-e5-v5",
        ),
    ),
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
    rerank=CollectionRerankOptions(
        enabled=True,
        service=RerankServiceOptions(
            provider="nvidia",
            model_name="nvidia/llama-3.2-nv-rerankqa-1b-v2",
        ),
    ),
)
collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient
from astrapy.constants import VectorMetric
from astrapy.info import CollectionDefinition

# Get an existing database
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)

# Create a collection
collection_definition = (
    CollectionDefinition.builder()
    .set_vector_dimension(1024)
    .set_vector_metric(VectorMetric.COSINE)
    .set_vector_service(
        provider="nvidia",
        model_name="nvidia/nv-embedqa-e5-v5",
    )
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
    .set_rerank("nvidia", "nvidia/llama-3.2-nv-rerankqa-1b-v2")
    .build()
)
collection = database.create_collection(
    "**COLLECTION_NAME**",
    definition=collection_definition,
)
